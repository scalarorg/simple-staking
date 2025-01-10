import ScalarAPI from "@/apis/scalar";

export const useScalarnetParams = () => {
  return ScalarAPI.useQuery("get", "/scalar/scalarnet/v1beta1/params", {});
};
