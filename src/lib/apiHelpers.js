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

/** Normalize RTK Query / unwrap() errors to a user-facing message. */
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  return err?.message || err?.data?.message || err?.data?.error || err?.error || fallback;
}
