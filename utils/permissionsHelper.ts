export const extractPermissionTypes = (permissions_type: any): string[] => {
  if (!permissions_type) return [];
  const vals = Object.values(permissions_type)
    .filter((v) => typeof v === "string" && v.trim() !== "");
  return [...new Set(vals)];
};
