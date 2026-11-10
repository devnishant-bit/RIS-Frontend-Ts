import styles from "./MyAssignmentToggle.module.css";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function MyAssignmentToggle({ checked, onChange }: Props) {
  return (
    <label className={styles.row}>
      <span className={styles.text}>My Assignment</span>
      <span className={styles.switch}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className={styles.slider} />
      </span>
    </label>
  );
}