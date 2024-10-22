import { z } from "zod";

const ProjectENVSchema = z.object({
  NEXT_PUBLIC_MEMPOOL_API: z.string().min(10),
  NEXT_PUBLIC_MEMPOOL_WEB: z.string().min(10),
  NEXT_PUBLIC_API_URL: z.string().min(10),
  NEXT_PUBLIC_DEFAULT_DAPP_CHAINS: z.string().min(10),
  NEXT_PUBLIC_SCALAR_SCANNER: z.string().min(10),
});

/**
 * Return system ENV with parsed values
 */
export const ProjectENV = ProjectENVSchema.parse({
  NEXT_PUBLIC_MEMPOOL_API: process.env.NEXT_PUBLIC_MEMPOOL_API,
  NEXT_PUBLIC_MEMPOOL_WEB: process.env.NEXT_PUBLIC_MEMPOOL_WEB,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_DEFAULT_DAPP_CHAINS: process.env.NEXT_PUBLIC_DEFAULT_DAPP_CHAINS,
  NEXT_PUBLIC_SCALAR_SCANNER: process.env.NEXT_PUBLIC_SCALAR_SCANNER,
});
