import { api } from "./client";

export interface RegisterOwnerPayload {
 name: string;
  phone: string;
  email: string;
  password: string;
  confirm: string;
}

export interface RegisterOwnerResponse {
  success?: boolean;
  id?: string;
  message?: string;
  field?: string | null;
  status?: number;
  errors?: { field: string | null; message: string }[];
}

export const registerOwner = async (payload: RegisterOwnerPayload): Promise<RegisterOwnerResponse> => {
  const res = await api.post("/registerOwner", payload);
  return res.data;
};

export const loginUser = async (payload: { email: string; password: string }) => {
  const res = await api.post("/loginUser", payload);
  return res.data;
};

