import config from "@/config";
import axios from "axios";
import { useState } from "react";
import styles from "../features/auth/pages/LoginPage.module.css";

export default function AppContent({
  hStatus,
}: {
  hStatus: (status: "active" | "inactive") => void;
}) {
  const [message, setMessage] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/tiservice/session/logout`,
        {},
        { withCredentials: true }
      );

      if (
        response.status === 200 &&
        response.data === "SUCCESS_LOGOUT"
      ) {
        setMessage("Logged Out");

        localStorage.removeItem("username");
        localStorage.removeItem("userid");
        localStorage.removeItem("features");
        localStorage.removeItem("idleTimeout");
        localStorage.removeItem("lastVisitedPath");
        localStorage.removeItem("pathStack");
        localStorage.removeItem("openWindows");

        hStatus("inactive");
      } else {
        setMessage("Logout failed");
         hStatus("inactive");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Error during logout");
      hStatus("inactive");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>App Content</h1>

        {message && <p>{message}</p>}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing out..." : "Logout"}
        </button>
      </section>
    </main>
  );
}