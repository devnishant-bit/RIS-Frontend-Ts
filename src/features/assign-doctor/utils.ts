interface StoredFeature {
  featureid: number;
  featurename: string;
}

export const WORKLIST_FEATURE_NAME = "Ris Display List";
export const ASSIGN_DOCTOR_FEATURE_NAME = "Assign Doctor";

export const getFeatureIdByName = (featurename: string): number | null => {
  try {
    const features: StoredFeature[] = JSON.parse(
      localStorage.getItem("features") || "[]"
    );
    return features.find((f) => f.featurename === featurename)?.featureid ?? null;
  } catch {
    return null;
  }
};

/** dd-mm-yyyy, same format the backend already expects */
export const formatAssignDate = (d = new Date()): string =>
  `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

/** HH:mm:ss (UTC), same as the old implementation */
export const formatAssignTime = (d = new Date()): string =>
  d.toISOString().split("T")[1].split(".")[0];

export const sameIdSet = (a: number[], b: number[]): boolean =>
  [...a].sort((x, y) => x - y).join(",") === [...b].sort((x, y) => x - y).join(",");