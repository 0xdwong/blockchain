import { ethers } from "ethers";
import { whatsabi } from "@shazow/whatsabi";

const address = "0x00000000006c3852cbEf3e08E8dF289169EdE581"; // Or your fav contract address


let result = await whatsabi.autoload(address, {
  provider: new ethers.getDefaultProvider(),

  // * Optional loaders:
  abiLoader: whatsabi.loaders.defaultABILoader,
  signatureLoader: whatsabi.loaders.defaultSignatureLookup,

  // * Optional hooks:
  // onProgress: (phase: string) => { ... }
  // onError: (phase: string, context: any) => { ... }

  // * Optional settings:
  // followProxies: false,
  // enableExperimentalMetadata: false,
});

console.log(result);