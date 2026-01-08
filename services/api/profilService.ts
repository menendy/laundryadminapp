// services/api/profilService.ts
import { api } from "./client";

export const updateProfile = async (
    id: string,
    payload: Record<string, any>
) => {
    const res = await api.put(`/updateProfile?id=${id}`, payload);
    return res.data;
};
