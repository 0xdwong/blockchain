import { encryptMessage } from "@zcloak/message";
import { randomAsHex } from "@zcloak/crypto";
import { VerifiablePresentationBuilder } from "@zcloak/vc";
import type { DidUrl } from "@zcloak/did-resolver/types";
import { getPrivateVC } from "./zclaok-sdk/vcHelper";
import { resolver } from "./zclaok-sdk/resolverHelper";
import { fromDidDocument } from "@zcloak/did/did/helpers";
import { sendMessage2Server } from "./zclaok-sdk/messageHelper";
import { restoreFromKeyFile } from "./did";
import { vpVerify } from "@zcloak/verify";
import { decryptMessage } from "@zcloak/message";
import { getMessage } from "./zclaok-sdk/messageHelper";



const sendVP = async () => {
    const verifierDidUrl: DidUrl =
        "did:zk:0xE3E87659826abD4c4AeA4d9dd4AFA5cf10D73fb8";

    const holder = restoreFromKeyFile("holder-DID-keys-file.json", String(process.env.HOLDER_PWD));

    // get verifier DID from DID Document
    const verifierDoc = await resolver.resolve(verifierDidUrl);
    const verifier = fromDidDocument(verifierDoc);

    // step1: get vc
    const vc0 = getPrivateVC("../../private-vc-example.json");
    // const vc0 = getPrivateVC("../../public-vc-example.json");

    // step2: build vp builder
    const vpBuilder = new VerifiablePresentationBuilder(holder);

    // step3: generate challange and build vp
    // note: you can add more vc to build multi type vp
    const challange = randomAsHex();
    const vp = await vpBuilder
        .addVC(vc0, "VP")
        // .addVC(vc0, "VP_Digest")
        // .addVC(vc0, "VP_SelectiveDisclosure", ["Name"])
        .build("Keccak256", challange);

    // step4: encrypt message
    // notice: receiverUrl parameter is verifier's keyAgreement key
    const message = await encryptMessage(
        "Send_VP",
        vp,
        holder,
        verifier.getKeyUrl("keyAgreement"),
        undefined,
        resolver
    );

    // step5: send encrypted message to server
    await sendMessage2Server(message);
};


const verifyVP = async () => {
    const holderDidUrl: DidUrl =
        "did:zk:0x117f339CCeea390Ca9a4e750A5dB5F67b48580fF";

    // step0: get holder and verifier DID
    // Get holder DID from DidDocument
    // We only need holder's KeyAgreement Public Key to search message
    const holderDidDoc = await resolver.resolve(holderDidUrl);
    const holder = fromDidDocument(holderDidDoc);

    const verifier = restoreFromKeyFile("verifier-DID-keys-file.json", String(process.env.VERIFIER_PWD));

    // step1: get message
    const serverMsgOrigin = await getMessage(holder, verifier, "Send_VP");
    const serverMsg = serverMsgOrigin.sort((a, b) => b.createTime - a.createTime);

    // step2: decrypt claim message
    const decrypted = await decryptMessage(serverMsg[0], verifier);

    // step3: verify vp
    const result = await vpVerify(decrypted.data);
    console.log(`verify vp result: ${result}`);
};

export {
    sendVP,
    verifyVP,
}