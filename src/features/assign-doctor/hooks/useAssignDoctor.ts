import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import * as api from "../api";
import type { Doctor, DoctorStatus, ExamDocPayload } from "../types";
import {
  WORKLIST_FEATURE_NAME,
  formatAssignDate,
  formatAssignTime,
  getFeatureIdByName,
  sameIdSet,
} from "../utils";

interface Args {
  isOpen: boolean;
  examid: number | string | null;
  onSave?: (doctors: Doctor[]) => void;
  onStatusUpdate?: () => void;
  onClose: () => void;
}

export function useAssignDoctor({ isOpen, examid, onSave, onStatusUpdate, onClose }: Args) {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<Doctor[]>([]);
  const [liveUserIds, setLiveUserIds] = useState<Set<number>>(new Set());
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const featureId = useMemo(() => getFeatureIdByName(WORKLIST_FEATURE_NAME), []);

  // Load everything each time the modal opens
  useEffect(() => {
  if (!isOpen) return;
  let cancelled = false;

  setSelectedDoctors([]);
  setSearchInput("");
  setError(null);
  setLoading(true);

  api
    .fetchAllDoctors(featureId)
    .then((doctors) => !cancelled && setAllDoctors(doctors))
    .catch((e) => {
      console.error("Error fetching doctors:", e);
      if (!cancelled) setError(e instanceof Error ? e.message : "An error occurred while fetching doctors.");
    })
    .finally(() => !cancelled && setLoading(false));

  api
    .fetchLiveUsers(featureId)
    .then((live) => !cancelled && setLiveUserIds(new Set(live.map((u) => u.userid))))
    .catch((e) => console.error("Error fetching live Users:", e));

  if (featureId && examid) {
    api
      .fetchAssignedDoctors(featureId, examid)
      .then((assigned) => !cancelled && setSelectedDoctors(assigned))
      .catch((e) => console.warn("Could not load assigned doctors:", e));
  }

  return () => {
    cancelled = true;
  };
}, [isOpen, examid, featureId]);

  const getDoctorStatus = useCallback(
    (userid?: number): DoctorStatus =>
      userid !== undefined && liveUserIds.has(userid) ? "online" : "away",
    [liveUserIds]
  );

  const filteredDoctors = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return [];
    return allDoctors.filter((d) => d.docname.toLowerCase().includes(q));
  }, [allDoctors, searchInput]);

  const selectDoctor = (doctor: Doctor) =>
    setSelectedDoctors((prev) => (prev.some((d) => d.id === doctor.id) ? prev : [...prev, doctor]));

  const removeDoctor = (doctor: Doctor) =>
    setSelectedDoctors((prev) => prev.filter((d) => d.id !== doctor.id));

  const clearAll = () => setSelectedDoctors([]);

  const close = () => {
    setSearchInput("");
    onClose();
  };

  const save = async () => {
    if (!featureId || !examid) return;
    setSaving(true);
    try {
      // Re-fetch to diff against the server's current state
      const previous = await api.fetchAssignedDoctors(featureId, examid);

      if (
        sameIdSet(
          selectedDoctors.map((d) => d.id),
          previous.map((d) => d.id)
        )
      ) {
        Swal.fire({
          title: "Warning!",
          text: "No changes made to the doctor assignment.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      const userid = localStorage.getItem("userid");
      const date = formatAssignDate();
      const time = formatAssignTime();

      const examdoc: ExamDocPayload[] = selectedDoctors.map((d) => ({
        userid, date, time, examid, doctorid: d.id, status: true,
      }));

      previous.forEach((prev) => {
        if (!selectedDoctors.some((d) => d.id === prev.id)) {
          examdoc.push({ userid, date, time, examid, doctorid: prev.id, status: false });
        }
      });

      const ok = await api.assignPhysician(featureId, examdoc);
      if (!ok) {
        Swal.fire({ title: "Error!", text: "Failed to save doctors.", icon: "error", confirmButtonText: "Ok" });
        return;
      }

      onSave?.(selectedDoctors);
      onStatusUpdate?.();
      await api.sendAssignmentNotifications(selectedDoctors, examid);

      Swal.fire({ title: "Success!", text: "Doctor(s) assigned successfully.", icon: "success", confirmButtonText: "Ok" });
      close();
    } catch (e) {
      if (e instanceof api.ExamNotFoundError) {
        Swal.fire({
          title: "Error!",
          text: `Exam ${examid} was not found, so doctors can't be assigned.`,
          icon: "error",
          confirmButtonText: "Ok",
        });
      } else {
        console.error("Error saving doctors:", e);
        Swal.fire({
          title: "Error!",
          text: "An error occurred while saving doctors.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    loading, saving, error,
    searchInput, setSearchInput,
    filteredDoctors, selectedDoctors,
    selectDoctor, removeDoctor, clearAll,
    getDoctorStatus, save, close,
  };
}