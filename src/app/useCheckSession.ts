import { useEffect } from "react";
import axios from "axios";
import config from "../config";

export async function checkSession(): Promise<boolean> {
  try {
    const response = await axios.post(
      `${config.apiBaseUrl}/tiservice/session/checksession`,
      {},
      {
        withCredentials: true,
      },
    );

    if (response.data === "SUCCESS_SESSION") {
      console.log("Session is active");
      return true;
    }

    return false;
  } catch {
    // throw error;
    console.log("Session is inactive");
    return false;
  }
}

export default function useCheckSession({
  sessionHandle,
}: {
  sessionHandle: (status: "active" | "inactive") => void;
}) {
  useEffect(() => {
    const verifySession = async () => {
      try {
        const isActive = await checkSession();

        sessionHandle(isActive ? "active" : "inactive");
      } catch (error) {
        console.error("Unable to verify session:", error);
      }
    };

    // Check immediately
    verifySession();

    const intervalId = setInterval(() => {
      checkSession();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [sessionHandle]);
}
