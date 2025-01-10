import "dotenv/config";
import { z } from "zod";

const ProjectENVSchema = z.object({
  NEXT_PUBLIC_MEMPOOL_API: z.string().min(10),
  NEXT_PUBLIC_API_URL: z.string().min(10),
  NEXT_PUBLIC_SCALAR_SCANNER: z.string().min(10),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .default("https://btc-staking.testnet.scalar.org"),
  NEXT_PUBLIC_SCALAR_API_URL: z.string().default("http://localhost:1317"),
});

/**
 * Return system ENV with parsed values
 */
export const ProjectENV = ProjectENVSchema.parse({
  NEXT_PUBLIC_MEMPOOL_API: process.env.NEXT_PUBLIC_MEMPOOL_API,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SCALAR_SCANNER: process.env.NEXT_PUBLIC_SCALAR_SCANNER,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SCALAR_API_URL: process.env.NEXT_PUBLIC_SCALAR_API_URL,
});
