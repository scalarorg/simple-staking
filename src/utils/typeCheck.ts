export const isNumeric = (str: string): boolean => {
  return !isNaN(parseFloat(str)) && isFinite(+str);
};
