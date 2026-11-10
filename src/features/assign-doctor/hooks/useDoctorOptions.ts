import { useEffect, useState } from "react";
import { fetchAllDoctors } from "../api";
import type { DoctorOption } from "../types";
import { WORKLIST_FEATURE_NAME, getFeatureIdByName } from "../utils";

export function useDoctorOptions() {
  const [options, setOptions] = useState<DoctorOption[]>([]);

  useEffect(() => {
    fetchAllDoctors(getFeatureIdByName(WORKLIST_FEATURE_NAME))
      .then((docs) => setOptions(docs.map((d) => ({ label: d.docname, value: d.id }))))
      .catch((e) => console.error("Error fetching doctors:", e));
  }, []);

  return options;
}