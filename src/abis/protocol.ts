const PROTOCOL_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_gateway", type: "address" },
      { internalType: "address", name: "_gasReceiver", type: "address" },
      { internalType: "address", name: "_token", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "InvalidAddress", type: "error" },
  { inputs: [], name: "NotApprovedByGateway", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "_from", type: "string" },
      { indexed: false, internalType: "string", name: "_to", type: "string" },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "Executed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "Unstaked",
    type: "event",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "commandId", type: "bytes32" },
      { internalType: "string", name: "sourceChain", type: "string" },
      { internalType: "string", name: "sourceAddress", type: "string" },
      { internalType: "bytes", name: "payload", type: "bytes" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "commandId", type: "bytes32" },
      { internalType: "string", name: "sourceChain", type: "string" },
      { internalType: "string", name: "sourceAddress", type: "string" },
      { internalType: "bytes", name: "payload", type: "bytes" },
      { internalType: "string", name: "tokenSymbol", type: "string" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "executeWithToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "gasService",
    outputs: [
      { internalType: "contract IAxelarGasService", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gateway",
    outputs: [
      { internalType: "contract IAxelarGateway", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      { internalType: "contract ICustomToken", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_destinationChain", type: "string" },
      { internalType: "string", name: "_destinationAddress", type: "string" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "string", name: "_psbtBase64", type: "string" },
    ],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
export default PROTOCOL_ABI;
