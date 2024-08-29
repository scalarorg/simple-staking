import { apiWrapper } from "./apiWrapper";

interface DeletePayload {
  id: string;
}

export const deleteDApp = async (id: string) => {
  const payload: DeletePayload = {
    id: id,
  };
  console.log(payload);

  const response = await apiWrapper(
    "DELETE",
    "/v1/dApp",
    "Error deleting dApp",
    payload,
  );

  // If the response status is 200, the request was accepted
  return response.status === 200;
};
