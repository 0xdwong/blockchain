import * as dotenv from 'dotenv';
import { initCrypto } from "@zcloak/crypto";
import * as vc from './vc';
import {sendVP, verifyVP} from './vp';

dotenv.config();


async function issueVC(){
    const receiver = "did:zk:0x117f339CCeea390Ca9a4e750A5dB5F67b48580fF";
    const ctypeHash = String(process.env.CTYPE_HAHS);
    const contents = {
        "Name": "Alice",
        "Role": "vip",
    };

    const vcStr = await vc.issue(receiver, ctypeHash, contents);
    console.log('====vcStr====', vcStr);
}


async function main(){
    await initCrypto();

    // await issueVC();
    await sendVP();
    await verifyVP()
}

main().then(() => {
    process.exit(0)
}).catch(err =>{
    console.error(err);
    process.exit(1);
})