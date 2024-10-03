import axios from "axios";

import { parseENV } from "@/env";

export const getMempoolAxios = (btcNetwork: string) => {
  const ProjectENV = parseENV(btcNetwork);
  return axios.create({
    baseURL: ProjectENV.NEXT_PUBLIC_MEMPOOL_API2,
  });
};
