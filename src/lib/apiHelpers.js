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

/** Trigger a browser download for a Blob / File. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Parse filename from Content-Disposition header when present. */
export function filenameFromContentDisposition(header, fallback) {
  if (!header || typeof header !== "string") return fallback;
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim().replace(/["']/g, ""));
    } catch {
      /* fall through */
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(header);
  if (plainMatch?.[1]) return plainMatch[1].trim();
  return fallback;
}
