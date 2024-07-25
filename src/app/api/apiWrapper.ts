import axios from "axios";

export const apiWrapper = async (
  method: "GET" | "POST" | "DELETE",
  url: string,
  generalErrorMessage: string,
  params?: any,
) => {
  let response;
  let handler;
  switch (method) {
    case "GET":
      handler = axios.get;
      break;
    case "POST":
      handler = axios.post;
      break;
    case "DELETE":
      handler = axios.delete;
      break;
    default:
      throw new Error("Invalid method");
  }

  try {
    // destructure params in case of post request
    if (method === "POST") {
      response = await handler(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        ...params,
      });
    } else if (method === "DELETE") {
      response = await handler(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        data: params,
      });
    } else {
      response = await handler(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        params,
      });
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.message;
      throw new Error(message || generalErrorMessage);
    } else {
      throw new Error(generalErrorMessage);
    }
  }
  return response;
};
