import createFetchClient from "openapi-fetch";
import createClient, { OpenapiQueryClient } from "openapi-react-query";

import { ProjectENV } from "@/env";
import { paths } from "@/types/schema";

const scalarFetchClient = createFetchClient<paths>({
  baseUrl: ProjectENV.NEXT_PUBLIC_SCALAR_API_URL,
});

const ScalarAPI: OpenapiQueryClient<paths> = createClient(scalarFetchClient);

export default ScalarAPI;
