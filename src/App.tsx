import { useState } from "react";
import AppContent from "./app/AppContent";
import LoginPage from "./features/auth/pages/LoginPage";
import useCheckSession from "./app/useCheckSession";

export function App() {
  const [checksession, setchecksession] = useState<'active' | 'inactive'>('active');

  function handleStatus(newStatus: 'active' | 'inactive'): void {
    setchecksession(newStatus);
  }

  
  useCheckSession({ sessionHandle: handleStatus });

  return (
    <>
      {checksession === 'active' ? (
        <AppContent hStatus={handleStatus} />
      ) : (
        <LoginPage />
      )}
    </>
  );
}