import { apiWrapper } from "./apiWrapper";

interface IdPayload {
  id: string;
}

export const toggleDApp = async (id: string) => {
  const payload: IdPayload = {
    id: id,
  };

  const response = await apiWrapper(
    "PATCH",
    "/v1/dApp",
    "Error toggling dApp request",
    payload,
  );

  // If the response status is 202, the request was accepted
  return response.status === 200;
};
