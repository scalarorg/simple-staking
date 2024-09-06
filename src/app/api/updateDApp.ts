import { apiWrapper } from "./apiWrapper";

interface DAppPayload {
  id: string;
  chain_name: string;
  btc_address_hex: string;
  public_key_hex: string;
  smart_contract_address: string;
}

export const updateDApp = async (
  id: string,
  chainName: string,
  btcAddressHex: string,
  publicKeyHex: string,
  smartContractAddress: string,
) => {
  const payload: DAppPayload = {
    id: id,
    chain_name: chainName,
    btc_address_hex: btcAddressHex,
    public_key_hex: publicKeyHex,
    smart_contract_address: smartContractAddress,
  };

  const response = await apiWrapper(
    "PUT",
    "/v1/dApp",
    "Error updating dApp request",
    payload,
  );

  // If the response status is 202, the request was accepted
  return response.status === 200;
};
