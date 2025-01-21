import ScalarAPI from "@/apis/scalar";

import { isEvmChain } from "../utils";

export const useGateway = (chain?: string) => {
  return ScalarAPI.useQuery(
    "get",
    "/scalar/chains/v1beta1/gateway_address/{chain}",
    {
      params: {
        path: { chain: chain || "" },
      },
    },
    {
      enabled: Boolean(chain) && isEvmChain(chain),
    },
  );
};
