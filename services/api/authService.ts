import { api } from "./client";

export const registerOwner = async (payload: {
  name: string;
  phone: string;
  email: string;
  password: string;
}) => {
  try {
    const res = await api.post("/registerOwner", payload);
    return res.data;
  } catch (e) {
    console.error("❌ registerOwner API:", e);
    return { success: false, message: "Network error" };
  }
};
