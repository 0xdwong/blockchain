import fs from "fs";
import path from "path";
import axios from "axios";
import { Keyring } from "@zcloak/keyring";
import { restore } from "@zcloak/did/keys";
import { Did } from "@zcloak/did";
import type { DidKeys$Json } from "@zcloak/did/keys/types";
import type { DidDocument } from "@zcloak/did-resolver/types";
import assert from "assert";

export function restoreFromKeyFile(filePath: string, pwd: string,): Did {
  const keyring = new Keyring();
  const keysFile = _readDidKeysFile(filePath);

  assert(pwd, 'no password');
  const attester = restore(keyring, keysFile, pwd);
  return attester;
}

function _readDidKeysFile(filePath: string) {
  const attesterKeysFile = fs.readFileSync(
    path.join(process.cwd(), filePath),
    { encoding: "utf-8" }
  );

  return JSON.parse(attesterKeysFile) as DidKeys$Json;
}

