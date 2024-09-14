import { encryptMessage } from "@zcloak/message";
import { Raw, VerifiableCredentialBuilder } from "@zcloak/vc";
import type { CType } from "@zcloak/ctype/types";
import type { RawCredential } from "@zcloak/vc/types";
import type { VerifiableCredential } from "@zcloak/vc/types";
import { resolver } from "./zclaok-sdk/resolverHelper";
import { getCtypeFromHash } from "./zclaok-sdk/ctypeHelper";
import { fromDidDocument } from "@zcloak/did/did/helpers";
import { sendMessage2Server } from "./zclaok-sdk/messageHelper";
import { Did } from "@zcloak/did";
import { restoreFromKeyFile } from "./did";


export async function issue(receiver: any, ctypeHash: string, contents: any): Promise<string> {
  // initCrypto for wasm
  // await initCrypto();
  // console.log("initCrypto for wasm...");

  const holderDidUrl = receiver;
  const holderDidDoc = await resolver.resolve(holderDidUrl);
  const holder = fromDidDocument(holderDidDoc);

  const attester = restoreFromKeyFile("attester-DID-keys-file.json", String(process.env.ATTESTER_PWD));

  // step1: get ctype
  const ctype: CType = await getCtypeFromHash(ctypeHash);

  // step2: build raw
  const raw = new Raw({
    contents: contents,
    owner: holderDidUrl,
    ctype: ctype,
    hashType: "Keccak256",
  });

  // step3: build rawCredential from raw
  const rawCredential: RawCredential = raw.toRawCredential("Keccak256");

  // step4: build a vcBuilder by using rawCredential and ctype
  const vcBuilder = VerifiableCredentialBuilder.fromRawCredential(
    rawCredential,
    ctype
  )
    .setExpirationDate(null)
    .setIssuanceDate(Date.now());

  // step5: build a vc
  const vc: VerifiableCredential<false> = await vcBuilder.build(
    attester,
    false
  );

  // _sendMessage2Server(vc, attester, holder);
  return JSON.stringify(vc);
};

async function _sendMessage2Server(vc: VerifiableCredential<any>, attester: Did, holder: Did) {
  // encrypt message
  // notice: receiverUrl parameter is holder's keyAgreement key
  const message = await encryptMessage(
    "Send_issuedVC",
    vc,
    attester,
    holder.getKeyUrl("keyAgreement"),
    undefined,
    resolver
  );

  // send encrypted message to server
  await sendMessage2Server(message);
}