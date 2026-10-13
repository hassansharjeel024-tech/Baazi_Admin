// Backend ka response { success, message, data } ki shakal mein aata hai
export const unwrap = (res) => res?.data?.data;

// Khali values ko hata deta hai
export function compact(obj = {}) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

// Image upload wali APIs (multipart/form-data) ke liye
export function toFormData(values = {}) {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    fd.append(key, value);
  });
  return fd;
}

export const MULTIPART = { headers: { "Content-Type": "multipart/form-data" } };