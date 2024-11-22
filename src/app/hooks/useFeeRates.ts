import { BtcMempool } from "@scalar-lab/bitcoin-vault";
import { useEffect, useState } from "react";

interface FeeRates {
  fastestFee: number;
  hourFee: number;
  minimumFee: number;
}

export const useFeeRates = (
  isOpen: boolean,
  address: string | undefined,
  mempoolClient: BtcMempool | undefined,
) => {
  const [feeRates, setFeeRates] = useState<FeeRates>({
    fastestFee: 1,
    hourFee: 1,
    minimumFee: 1,
  });

  useEffect(() => {
    const fetchFeeRates = async () => {
      if (!mempoolClient) return;
      if (!isOpen || !address) return;
      try {
        const { fees } = mempoolClient;
        const { fastestFee, hourFee, minimumFee } =
          await fees.getFeesRecommended();

        setFeeRates({
          fastestFee,
          hourFee,
          minimumFee,
        });
      } catch (error) {
        console.warn("Error fetching fee rates:", error);
        setFeeRates({
          fastestFee: 1,
          hourFee: 1,
          minimumFee: 1,
        });
      }
    };

    fetchFeeRates();
  }, [isOpen, address, mempoolClient]);

  return feeRates;
};
