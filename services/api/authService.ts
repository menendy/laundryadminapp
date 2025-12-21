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

// services/api/authService.ts
export const loginUser = async (payload: { uid: string }) => {
  const res = await api.post("/loginUser", payload);
  return res.data;
};


export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  success?: boolean;
  message?: string;
  field?: string;
}

export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  const res = await api.post("/forgotPassword", payload);
  return res.data;
};

// ============================
// CHECK FORGOT PASSWORD
// ============================
export const checkForgotPassword = async (payload: { email: string }) => {
  const res = await api.post("/checkForgotPassword", payload);
  return res.data;
};

