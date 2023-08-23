import { ethers } from "ethers";
import { whatsabi } from "@shazow/whatsabi";

// Or your fav contract address
const address = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC


let result = await whatsabi.autoload(address, {
  provider: new ethers.getDefaultProvider(),

  // * Optional loaders:
  abiLoader: whatsabi.loaders.defaultABILoader,
  signatureLoader: whatsabi.loaders.defaultSignatureLookup,

  // * Optional hooks:
  // onProgress: (phase: string) => { ... }
  // onError: (phase: string, context: any) => { ... }

  // * Optional settings:
  followProxies: true,
  // enableExperimentalMetadata: false,
});

console.log(result);