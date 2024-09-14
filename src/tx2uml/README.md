npx tx2uml call 0x3cf8fd116d366bcf3e3fc7e8e03e87a22fb644fef31594811dfe9e6b10b5dbf8 -c mainnet -k ZVGJ95QNG19RPD8UXU6RYM8PKP2IBH61JG
npx tx2uml call 0x3cf8fd116d366bcf3e3fc7e8e03e87a22fb644fef31594811dfe9e6b10b5dbf8 -c mainnet -u https://eth-mainnet.g.alchemy.com/v2/X4LKVCU7jKGIWq36MFsISJDJaAuTOQZk



curl --location --request POST 'https://eth-mainnet.g.alchemy.com/v2/X4LKVCU7jKGIWq36MFsISJDJaAuTOQZk' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc":"2.0",
    "method":"trace_transaction",
    "params":["0xb2b0e7b286e83255928f81713ff416e6b8d0854706366b6a9ace46a88095f024"],
    "id":1
}'