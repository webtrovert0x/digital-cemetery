export const BOT_DIGITAL_CEMETERY_ABI = [
  {
    inputs: [],
    name: "EmptyInscription",
    type: "error",
  },
  {
    inputs: [],
    name: "EmptyProjectName",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "graveId",
        type: "uint256",
      },
    ],
    name: "GraveAlreadyDugUp",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "graveId",
        type: "uint256",
      },
    ],
    name: "GraveNotFound",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "length",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxLength",
        type: "uint256",
      },
    ],
    name: "InscriptionTooLong",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "graveId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "NotGraveOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "length",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxLength",
        type: "uint256",
      },
    ],
    name: "ProjectNameTooLong",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "graveId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "projectName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ProjectBuried",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "graveId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ProjectDugUp",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_INSCRIPTION_LENGTH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_PAGE_SIZE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_PROJECT_NAME_LENGTH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "projectName",
        type: "string",
      },
      {
        internalType: "string",
        name: "inscription",
        type: "string",
      },
    ],
    name: "buryProject",
    outputs: [
      {
        internalType: "uint256",
        name: "graveId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "graveId",
        type: "uint256",
      },
    ],
    name: "digUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "graveId",
        type: "uint256",
      },
    ],
    name: "getGrave",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "string",
            name: "projectName",
            type: "string",
          },
          {
            internalType: "string",
            name: "inscription",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "burialTimestamp",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isDugUp",
            type: "bool",
          },
        ],
        internalType: "struct BOTDigitalCemetery.Grave",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "graveId",
        type: "uint256",
      },
    ],
    name: "getGraveStatus",
    outputs: [
      {
        internalType: "enum BOTDigitalCemetery.GraveStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getGravesByOwner",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "offset",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "newestFirst",
        type: "bool",
      },
    ],
    name: "getGravesByOwnerPaginated",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "string",
            name: "projectName",
            type: "string",
          },
          {
            internalType: "string",
            name: "inscription",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "burialTimestamp",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isDugUp",
            type: "bool",
          },
        ],
        internalType: "struct BOTDigitalCemetery.Grave[]",
        name: "graves",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "total",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "offset",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "newestFirst",
        type: "bool",
      },
    ],
    name: "getGravesPaginated",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "string",
            name: "projectName",
            type: "string",
          },
          {
            internalType: "string",
            name: "inscription",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "burialTimestamp",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isDugUp",
            type: "bool",
          },
        ],
        internalType: "struct BOTDigitalCemetery.Grave[]",
        name: "graves",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "total",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getOwnerGraveCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalActiveGraves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalDugUpGraves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalGraves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

