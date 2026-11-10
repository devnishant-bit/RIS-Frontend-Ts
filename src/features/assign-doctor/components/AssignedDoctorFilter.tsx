import Select from "react-select";
import { useDoctorOptions } from "../hooks/useDoctorOptions";
import type { DoctorOption } from "../types";

interface Props {
  value: DoctorOption | null;
  onChange: (option: DoctorOption | null) => void;
}

export default function AssignedDoctorFilter({ value, onChange }: Props) {
  const options = useDoctorOptions();
  return (
    <Select<DoctorOption>
      options={options}
      value={value}
      onChange={(o) => onChange(o ?? null)}
      placeholder="Search Assigned Doc"
      isClearable
    />
  );
}