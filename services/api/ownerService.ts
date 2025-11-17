import { api } from "./client";

export const getPendingOwners = async () => {
  const res = await api.get("/getPendingOwners");
  return res.data;
};

export const activateOwner = async (owner_uid: string) => {
  const res = await api.post("/activateOwner", { owner_uid });
  return res.data;
};

