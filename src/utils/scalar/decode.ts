export const decodeScalarBytes = (scalarBytes: string) => {
  return Buffer.from(scalarBytes, "base64");
};

export const decodeScalarBytesToUint8Array = (scalarBytes: string) => {
  return Uint8Array.from(decodeScalarBytes(scalarBytes));
};

export const decodeScalarBytesToHex = (scalarBytes: string) => {
  return Buffer.from(decodeScalarBytes(scalarBytes)).toString("hex");
};

export const decodeScalarBytesToString = (scalarBytes: string) => {
  return Buffer.from(decodeScalarBytes(scalarBytes)).toString("utf-8");
};
