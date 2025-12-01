// src/utils/binaryToBase64.js

/**
 * Convert binary data (ArrayBuffer / Uint8Array / plain array of bytes)
 * into a Base64 string.
 *
 * @param {ArrayBuffer|Uint8Array|number[]} data
 * @returns {string} Base64 string (no data: prefix)
 */
export function binaryToBase64(data) {
  let bytes;

  if (data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data);
  } else if (data instanceof Uint8Array) {
    bytes = data;
  } else if (Array.isArray(data)) {
    bytes = Uint8Array.from(data);
  } else {
    throw new Error("Unsupported binary type passed to binaryToBase64");
  }

  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  // Convert to Base64 in the browser
  return window.btoa(binary);
}

/**
 * Optional: return a data URL for PNG
 */
export function binaryToPngDataUrl(data) {
  const b64 = binaryToBase64(data);
  return `data:image/png;base64,${b64}`;
}
