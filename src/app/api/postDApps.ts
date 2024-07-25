import { apiWrapper } from "./apiWrapper";

interface DAppPayload {
  chain_name: string;
  btc_address_hex: string;
  public_key_hex: string;
}

export const postDApp = async (
  chainName: string,
  btcAddressHex: string,
  publicKeyHex: string,
) => {
  const payload: DAppPayload = {
    chain_name: chainName,
    btc_address_hex: btcAddressHex,
    public_key_hex: publicKeyHex,
  };

  const response = await apiWrapper(
    "POST",
    "/v1/dApp",
    "Error submitting dApp request",
    payload,
  );

  // If the response status is 202, the request was accepted
  return response.status === 202;
};
