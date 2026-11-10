import { AiOutlineInfoCircle } from "react-icons/ai";
import type { AssignedDoctorRef } from "../types";
import styles from "./AssignedDoctorCell.module.css";

export default function AssignedDoctorCell({ doctors }: { doctors?: AssignedDoctorRef[] }) {
  const names = (doctors ?? [])
    .map((d) => d.doctorName)
    .filter((n): n is string => Boolean(n));

  if (names.length === 0) return <span />;
  if (names.length === 1) return <span>{names[0]}</span>;

  return (
    <span className={styles.wrap}>
      <AiOutlineInfoCircle size={16} className={styles.icon} />
      <span className={styles.tip}>{names.join(", ")}</span>
    </span>
  );
}