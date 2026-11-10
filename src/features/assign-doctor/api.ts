import axios from "axios";
import config from "@/config";
import type { Doctor, ExamDocPayload, LiveUser } from "./types";

const base = `${config.apiBaseUrl}/tiservice`;

export const fetchAllDoctors = async (featureid: number | null): Promise<Doctor[]> => {
  const { data } = await axios.post(`${base}/doctor/getalldoctors`, { featureid });
  if (data.retval !== "SUCCESS") throw new Error("No Doctors/Failed to fetch doctors.");
  return data.doctorlist as Doctor[];
};

export const fetchLiveUsers = async (featureid: number | null): Promise<LiveUser[]> => {
  const { data } = await axios.post(`${base}/session/getallsessions`, { featureid });
  return (data?.userlist ?? []) as LiveUser[];
};

interface RawAssigned {
  doctorname: string;
  doctorid: number;
  userid?: number;
}

export class ExamNotFoundError extends Error {}

export const fetchAssignedDoctors = async (
  featureid: number,
  examid: number | string
): Promise<Doctor[]> => {
  try {
    const { data } = await axios.post(`${base}/assign/getphysician`, { featureid, examid });
    if (data.retval !== "SUCCESS") return [];
    return (data.doctor as RawAssigned[]).map((d) => ({
      docname: d.doctorname,
      id: d.doctorid,
      userid: d.userid,
    }));
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      throw new ExamNotFoundError(`Exam ${examid} not found`);
    }
    throw e;
  }
};

export const assignPhysician = async (
  featureid: number,
  examdoc: ExamDocPayload[]
): Promise<boolean> => {
  const { data } = await axios.post(`${base}/assign/assignphysician`, { featureid, examdoc });
  return data.retval === "SUCCESS";
};

export const sendAssignmentNotifications = async (
  doctors: Doctor[],
  examid: number | string
): Promise<void> => {
  const currentUserId = Number(localStorage.getItem("userid"));
  const recipients = [
    ...new Set(
      doctors
        .filter((d) => d.userid && Number(d.userid) !== currentUserId)
        .map((d) => Number(d.userid))
    ),
  ];
  if (!recipients.length) return;

  await Promise.allSettled(
    recipients.map((recipientUserId) =>
      axios
        .post(`${base}/notification/demo`, {
          recipientUserId,
          type: "DOCTOR_ASSIGNED",
          title: "Doctor Assigned",
          message: examid
            ? `You have been assigned to a study with exam ID ${examid}.`
            : "You have been assigned to a study.",
          createdAt: new Date().toISOString(),
        })
        .catch((e) => console.error("Error sending doctor assignment notification:", e))
    )
  );
};