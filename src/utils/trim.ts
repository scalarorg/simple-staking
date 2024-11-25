export const trim = (str: string, symbols: number = 8) => {
  return `${str.slice(0, symbols / 2)}...${str.slice(-symbols / 2)}`;
};

export const hexStringWithout0x = (str: string) => {
  if (str.startsWith("0x") && str.length > 2) {
    return str.slice(2);
  }
  return str;
};

export const hexStringWith0x = (str: string): `0x${string}` => {
  if (!str.startsWith("0x")) {
    return `0x${str}`;
  }
  return str as `0x${string}`;
};
