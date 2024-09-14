---
eip: 4844
title: Shard Blob Transactions
description: Shard Blob Transactions scale data-availability of Ethereum in a simple, forwards-compatible manner.
author: Vitalik Buterin (@vbuterin), Dankrad Feist (@dankrad), Diederik Loerakker (@protolambda), George Kadianakis (@asn-d6), Matt Garnett (@lightclient), Mofi Taiwo (@Inphi), Ansgar Dietrichs (@adietrichs)
discussions-to: https://ethereum-magicians.org/t/eip-4844-shard-blob-transactions/8430
status: Review
type: Standards Track
category: Core
created: 2022-02-25
requires: 1559, 2718, 2930, 4895
---

## 摘要

介绍了一种新的交易格式，用于“携带大量数据的交易”，其中包含无法通过 EVM 执行访问的大量数据，但其承诺可以被访问。
该格式旨在与将在完整分片中使用的格式完全兼容。



## 动机

Rollups 在短期和中期，可能也在长期内，是以太坊的唯一无信任扩展解决方案。
L1 上的交易费用已经很高很多个月了，因此迫切需要采取任何必要的措施来帮助促进整个生态系统向 Rollups 的迁移。
对于许多以太坊用户，Rollups 显著降低了费用：Optimism 和 Arbitrum 经常提供的费用比以太坊基础层本身低约 3-8 倍，
而具有更好数据压缩并且可以避免包括签名的 ZK rollups，其费用比基础层低约 40-100 倍。

然而，即使这些费用对许多用户来说也太昂贵了。长期解决方案是 Rollups 本身的长期不足，一直都是数据分片，这将为 Rollups 增加每个区块约 16 MB 的专用数据空间。
然而，数据分片仍需要相当长的时间来完成实施和部署。

该 EIP 提供了一个临时解决方案，即通过实现将在分片中使用的“交易格式”，而不实际分片这些交易。
相反，来自此交易格式的数据仅是信标链的一部分，并且由所有共识节点完全下载（但可以在相对较短的延迟后删除）。
与完整的数据分片相比，该 EIP 对可以包括的这些交易的数量设置了限制，对应于每个区块约 0.375 MB 的目标和约 0.75 MB 的限制。



## 规范

### 参数

| 常量 | 值 |
| - | - |
| `BLOB_TX_TYPE` | `Bytes1(0x03)` |
| `BYTES_PER_FIELD_ELEMENT` | `32` |
| `FIELD_ELEMENTS_PER_BLOB` | `4096` |
| `BLS_MODULUS` | `52435875175126190479447740508185965837690552500527637822603658699938581184513` |
| `VERSIONED_HASH_VERSION_KZG` | `Bytes1(0x01)` |
| `POINT_EVALUATION_PRECOMPILE_ADDRESS` | `Bytes20(0x0A)` |
| `POINT_EVALUATION_PRECOMPILE_GAS` | `50000` |
| `MAX_BLOB_GAS_PER_BLOCK` | `786432` |
| `TARGET_BLOB_GAS_PER_BLOCK` | `393216` |
| `MIN_BLOB_GASPRICE` | `1` |
| `BLOB_GASPRICE_UPDATE_FRACTION` | `3338477` |
| `LIMIT_BLOBS_PER_TX` | `2**12` |
| `GAS_PER_BLOB` | `2**17` |
| `HASH_OPCODE_BYTE` | `Bytes1(0x49)` |
| `HASH_OPCODE_GAS` | `3` |

### 类型别名

| 类型 | 基本类型 | 附加检查 |
| - | - | - |
| `Blob` | `ByteVector[BYTES_PER_FIELD_ELEMENT * FIELD_ELEMENTS_PER_BLOB]` | |
| `VersionedHash` | `Bytes32` | |
| `KZGCommitment` | `Bytes48` | 执行 IETF BLS 签名“KeyValidate”检查，但允许身份点 |
| `KZGProof` | `Bytes48` | 与`KZGCommitment`相同 |

### 密码学助手

在本提案中，我们使用了对应的[共识 4844 规范](https://github.com/ethereum/consensus-specs/blob/86fb82b221474cc89387fa6436806507b3849d88/specs/deneb)中定义的密码学方法和类。

具体来说，我们使用了 [`polynomial-commitments.md`](https://github.com/ethereum/consensus-specs/blob/86fb82b221474cc89387fa6436806507b3849d88/specs/deneb/polynomial-commitments.md) 中的以下方法：

- [`verify_kzg_proof()`](https://github.com/ethereum/consensus-specs/blob/86fb82b221474cc89387fa6436806507b3849d88/specs/deneb/polynomial-commitments.md#verify_kzg_proof)
- [`verify_blob_kzg_proof_batch()`](https://github.com/ethereum/consensus-specs/blob/86fb82b221474cc89387fa6436806507b3849d88/specs/deneb/polynomial-commitments.md#verify_blob_kzg_proof_batch)

### 助手

```python
def kzg_to_versioned_hash(commitment: KZGCommitment) -> VersionedHash:
    return VERSIONED_HASH_VERSION_KZG + sha256(commitment)[1:]
```

使用泰勒展开近似计算`factor * e ** (numerator / denominator)`：

```python
def fake_exponential(factor: int, numerator: int, denominator: int) -> int:
    i = 1
    output = 0
    numerator_accum = factor * denominator
    while numerator_accum > 0:
        output += numerator_accum
        numerator_accum = (numerator_accum * numerator) // (denominator * i)
        i += 1
    return output // denominator
```

### Blob 交易

我们引入了一种新的 [EIP-2718](./eip-2718.md) 交易，“blob 交易”，其中`TransactionType`为`BLOB_TX_TYPE`，而`TransactionPayload`是以下`TransactionPayloadBody`的 RLP 序列化：

```
[chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, to, value, data, access_list, max_fee_per_blob_gas, blob_versioned_hashes, y_parity, r, s]
```

字段`chain_id`、`nonce`、`max_priority_fee_per_gas`、`max_fee_per_gas`、`gas_limit`、`value`、`data`和`access_list`遵循与 [EIP-1559](./eip-1559.md) 相同的语义。

字段`to`与语义略有不同，但例外是它不能为`nil`，因此必须始终表示 20 字节地址。这意味着 blob 交易不能采用创建交易的形式。

字段`max_fee_per_blob_gas`是`uint256`类型，字段`blob_versioned_hashes`表示`kzg_to_versioned_hash`的哈希输出列表。

对于此交易的 [EIP-2718](./eip-2718.md)`ReceiptPayload`为`rlp([status, cumulative_transaction_gas_used, logs_bloom, logs])`。

#### 签名

签名值`y_parity`、`r`和`s`是通过构造 secp256k1 签名计算以下摘要而计算的：

`keccak256(BLOB_TX_TYPE || rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, to, value, data, access_list, max_fee_per_blob_gas, blob_versioned_hashes]))`。

### 头部扩展

当前的头部编码使用了两个新的 64 位无符号整数字段进行扩展：

- `blob_gas_used`是区块内交易消耗的 blob gas 的总量。
- `excess_blob_gas`是在区块之前消耗的超出目标的 blob gas 的累积总量。消耗超出目标的 blob gas 的区块会增加此值，消耗低于目标的 blob gas 的区块会减少此值（在 0 处限制）。

因此，头部的 RLP 编码如下：

```
rlp([
    parent_hash,
    0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347, # ommers hash
    coinbase,
    state_root,
    txs_root,
    receipts_root,
    logs_bloom,
    0, # difficulty
    number,
    gas_limit,
    gas_used,
    timestamp,
    extradata,
    prev_randao,
    0x0000000000000000, # nonce
    base_fee_per_gas,
    withdrawals_root,
    blob_gas_used,
    excess_blob_gas,
])
```

`excess_blob_gas`的值可以使用父头部进行计算。

```python
def calc_excess_blob_gas(parent: Header) -> int:
    if parent.excess_blob_gas + parent.blob_gas_used < TARGET_BLOB_GAS_PER_BLOCK:
        return 0
    else:
        return parent.excess_blob_gas + parent.blob_gas_used - TARGET_BLOB_GAS_PER_BLOCK
```

对于第一个分叉后的区块，`parent.blob_gas_used`和`parent.excess_blob_gas`都被计算为`0`。

### Gas 计算

我们引入 blob gas 作为一种新类型的 gas。它独立于普通 gas，并遵循其自己的目标规则，类似于 EIP-1559。
我们使用`excess_blob_gas`头部字段来存储计算 blob gas 价格所需的持久数据。目前，只有 blob 的价格是以 blob gas 计价的。

```python
def calc_data_fee(header: Header, tx: SignedBlobTransaction) -> int:
    return get_total_blob_gas(tx) * get_blob_gasprice(header)

def get_total_blob_gas(tx: SignedBlobTransaction) -> int:
    return GAS_PER_BLOB * len(tx.blob_versioned_hashes)

def get_blob_gasprice(header: Header) -> int:
    return fake_exponential(
        MIN_BLOB_GASPRICE,
        header.excess_blob_gas,
        BLOB_GASPRICE_UPDATE_FRACTION
    )
```

区块的有效性条件被修改以包括 blob gas 检查（请参见下面的[执行层验证](#execution-layer-validation)部分）。

通过`calc_data_fee`计算的实际`data_fee`在交易执行之前从发送者余额中扣除并燃烧，如果交易失败，则不予退还。

### 获取版本哈希的操作码

我们添加了一个指令`BLOBHASH`（使用操作码`HASH_OPCODE_BYTE`），它从堆栈顶部读取大端`uint256`作为`index`，如果`index < len(tx.blob_versioned_hashes)`，则用`tx.blob_versioned_hashes[index]`替换堆栈上的值，否则用零填充的`bytes32`值替换。该操作码的 gas 成本为`HASH_OPCODE_GAS`。

### 点评估预编译

在`POINT_EVALUATION_PRECOMPILE_ADDRESS`添加一个预编译，用于验证一个 KZG 证明，该证明声称一个 blob（由承诺表示）在给定点上评估为给定值。```python
(((((POINT_EVALUATION_PRECOMPILE_GAS)))))
```
该预编译的成本为`POINT_EVALUATION_PRECOMPILE_GAS`，并执行以下逻辑：

```python
def point_evaluation_precompile(input: Bytes) -> Bytes:
    """
    Verify p(z) = y given commitment that corresponds to the polynomial p(x) and a KZG proof.
    Also verify that the provided commitment matches the provided versioned_hash.
    """
    # The data is encoded as follows: versioned_hash | z | y | commitment | proof | with z and y being padded 32 byte big endian values
    assert len(input) == 192
    versioned_hash = input[:32]
    z = input[32:64]
    y = input[64:96]
    commitment = input[96:144]
    proof = input[144:192]

    # Verify commitment matches versioned_hash
    assert kzg_to_versioned_hash(commitment) == versioned_hash

    # Verify KZG proof with z and y in big endian format
    assert verify_kzg_proof(commitment, z, y, proof)

    # Return FIELD_ELEMENTS_PER_BLOB and BLS_MODULUS as padded 32 byte big endian values
    return Bytes(U256(FIELD_ELEMENTS_PER_BLOB).to_be_bytes32() + U256(BLS_MODULUS).to_be_bytes32())
```
该预编译必须拒绝非规范的字段元素（即提供的字段元素必须严格小于`BLS_MODULUS`）。

### 共识层验证

在共识层中，这些块被引用，但在信标块主体中并未完全编码。
在主体中嵌入完整内容的代替方案是，这些块被单独传播，作为“旁路”。

这种“旁路”设计通过黑盒化`is_data_available()`提供了进一步数据增加的前向兼容性：
在完全分片的情况下，`is_data_available()`可以被数据可用性采样（DAS）替换，从而避免所有信标节点在网络上下载所有块。

请注意，共识层的任务是持久化块以确保数据可用性，而执行层不是。

`ethereum/consensus-specs`存储库定义了涉及此 EIP 的以下共识层更改：

- 信标链：处理更新的信标块并确保块是可用的。
- P2P 网络：传播和同步更新的信标块类型和新的块旁路。
- 诚实的验证者：生成带有块的信标块；签署并发布相关的块旁路。

### 执行层验证

在执行层，块的有效条件扩展如下：

```python
def validate_block(block: Block) -> None:
    ...

    # check that the excess blob gas was updated correctly
    assert block.header.excess_blob_gas == calc_excess_blob_gas(block.parent.header)

    blob_gas_used = 0

    for tx in block.transactions:
        ...

        # modify the check for sufficient balance
        max_total_fee = tx.gas * tx.max_fee_per_gas
        if type(tx) is SignedBlobTransaction:
            max_total_fee += get_total_blob_gas(tx) * tx.max_fee_per_blob_gas
        assert signer(tx).balance >= max_total_fee

        ...

        # add validity logic specific to blob txs
        if type(tx) is SignedBlobTransaction:
            # there must be at least one blob
            assert len(tx.blob_versioned_hashes) > 0

            # all versioned blob hashes must start with VERSIONED_HASH_VERSION_KZG
            for h in tx.blob_versioned_hashes:
                assert h[0] == VERSIONED_HASH_VERSION_KZG

            # ensure that the user was willing to at least pay the current blob gasprice
            assert tx.max_fee_per_blob_gas >= get_blob_gasprice(block.header)

            # keep track of total blob gas spent in the block
            blob_gas_used += get_total_blob_gas(tx)

    # ensure the total blob gas spent is at most equal to the limit
    assert blob_gas_used <= MAX_BLOB_GAS_PER_BLOCK

    # ensure blob_gas_used matches header
    assert block.header.blob_gas_used == blob_gas_used

```

### 网络

块事务有两种网络表示。在事务传播响应（`PooledTransactions`）期间，块事务的 EIP-2718 `TransactionPayload`被包装成：

```
rlp([tx_payload_body, blobs, commitments, proofs])
```

这些元素的定义如下：

- `tx_payload_body` - 是标准 EIP-2718 [块事务](#blob-transaction)的`TransactionPayloadBody`
- `blobs` - `Blob`项目的列表
- `commitments` - 相应`blobs`的`KZGCommitment`列表
- `proofs` - 相应`blobs`和`commitments`的`KZGProof`列表

节点必须验证`tx_payload_body`并对其进行包装数据的验证。为此，请确保：

- `tx_payload_body.blob_versioned_hashes`、`blobs`、`commitments`和`proofs`的数量相等。
- KZG `commitments`哈希到版本哈希，即`kzg_to_versioned_hash(commitments[i]) == tx_payload_body.blob_versioned_hashes[i]`
- KZG `commitments`与相应的`blobs`和`proofs`匹配。（注意：这可以使用`verify_blob_kzg_proof_batch`进行优化，对于从承诺和每个块的数据派生的点的随机评估，可以使用证明）

对于主体检索响应（`BlockBodies`），使用标准的 EIP-2718 块事务`TransactionPayload`。

节点不得自动向其对等方广播块事务。
相反，这些事务仅通过`NewPooledTransactionHashes`消息进行宣布，然后可以通过`GetPooledTransactions`手动请求。

## 基本原理

### 迈向分片

该 EIP 引入了块事务，其格式与最终分片规范中预期的格式相同。
这为 Rollups 提供了临时但重要的扩展，使它们最初可以扩展到每个插槽 0.375 MB，同时使用单独的费用市场允许在使用该系统受限时费用非常低。

Rollup 扩展的核心目标是提供临时扩展，而不会给 Rollups 带来额外的开发负担。
今天，Rollups 使用 calldata。将来，Rollups 将不得不使用分片数据（也称为“块”），因为分片数据将会便宜得多。
因此，Rollups 无法避免在某个阶段至少进行一次对数据处理的大型升级。
但我们可以确保 Rollups 只需要进行一次升级。
这立即意味着临时扩展只有两种可能性：（i）减少现有 calldata 的 gas 成本，和（ii）提前使用将用于分片数据的格式，但实际上尚未进行分片。
以前的 EIP 都是属于（i）类别的解决方案；而这个 EIP 是属于（ii）类别的解决方案。

设计该 EIP 的主要权衡是现在实施更多还是以后实施更多：
我们是在通往完全分片的过程中实施了 25%的工作，还是 50%，还是 75%？

该 EIP 中已经完成的工作包括：

- 一种新的事务类型，与“完全分片”中需要存在的格式完全相同
- 完全分片所需的所有执行层逻辑
- 完全分片所需的所有执行/共识交叉验证逻辑
- `BeaconBlock`验证和数据可用性采样块之间的层分离
- 完全分片所需的大部分`BeaconBlock`逻辑
- 用于块的自调整独立的 gasprice

要完成的工作包括：

- 在共识层中对`commitments`进行低度扩展，以允许 2D 采样
- 数据可用性采样的实际实现
- PBS（提议者/构建者分离），以避免要求单个验证者在一个插槽中处理 32 MB 的数据
- 每个验证者验证每个块中分片数据的监护证明或类似的协议要求

该 EIP 还为长期协议清理奠定了基础。例如，其（更清晰的）gas 价格更新规则可以应用于主要的 basefee 计算。

### Rollups 的功能

Rollups 不会将 Rollup 块数据放入事务 calldata 中，而是期望 Rollup 块提交者将数据放入块中。这保证了可用性（这是 Rollups 所需的），但比 calldata 要便宜得多。
Rollups 只需要在提交欺诈证明时实际提供基础数据。
欺诈证明可以逐步验证转换，通过 calldata 一次加载最多几个块的值。
对于每个值，它将提供一个 KZG 证明，并使用点评估预编译来验证该值与之前提交的版本哈希的一致性，然后像今天一样对该数据执行欺诈证明验证。

ZK Rollups 将为其事务或状态增量数据提供两个承诺：
块承诺（协议确保指向可用数据）和 ZK Rollup 使用内部证明系统的自身承诺。
它们将使用等价性证明协议，使用点评估预编译，证明这两个承诺指向相同的数据。

### 版本哈希和预编译返回数据

我们在执行层中使用版本哈希（而不是承诺）作为对块的引用，以确保与未来更改的前向兼容性。
例如，如果出于量子安全原因我们需要切换到 Merkle 树+STARKs，那么我们将添加一个新版本，允许点评估预编译与新格式一起工作。
Rollups 不必对它们的工作方式进行任何 EVM 级别的更改；
序列化程序只需在适当的时候切换到使用新的事务类型。

然而，点评估发生在有限域内，只有在已知域模数的情况下才是明确定义的。智能合约可以包含一个将承诺版本映射到模数的表，但这不允许智能合约考虑未知的未来模数的升级。通过允许智能合约访问 EVM 内部的模数，智能合约可以构建成可以使用未来的承诺和证明，而无需进行升级。

为了不增加另一个预编译，我们直接从点评估预编译中返回模数和多项式度。然后调用者可以使用它。这也是“免费”的，因为调用者可以忽略返回值的这一部分而不会产生额外成本——在可预见的未来保持可升级的系统可能会暂时使用这种方式。

### Blob gasprice update rule 

blob gasprice 更新规则旨在近似公式 `blob_gasprice = MIN_BLOB_GASPRICE * e**(excess_blob_gas / BLOB_GASPRICE_UPDATE_FRACTION)`，其中 `excess_blob_gas` 是链相对于每个区块的“目标”数量（`TARGET_BLOB_GAS_PER_BLOCK` 每个区块）消耗的总“额外” blob gas 量。与 EIP-1559 类似，这是一个自我校正的公式：随着额外量的增加，`blob_gasprice` 呈指数增长，减少使用量，并最终迫使额外量减少。

每个区块的行为大致如下。
如果区块 `N` 消耗 `X` blob gas，则在区块 `N+1` 中，`excess_blob_gas` 增加了 `X - TARGET_BLOB_GAS_PER_BLOCK`，因此区块 `N+1` 的 `blob_gasprice` 按照因子 `e**((X - TARGET_BLOB_GAS_PER_BLOCK) / BLOB_GASPRICE_UPDATE_FRACTION)` 增加。因此，它具有与现有 EIP-1559 类似的效果，但在某种意义上更“稳定”，因为它对相同的总使用量做出相同的响应，而不管它是如何分布的。

参数 `BLOB_GASPRICE_UPDATE_FRACTION` 控制 blob gas 价格的最大变化率。它被选择为以每个区块约 `e(TARGET_BLOB_GAS_PER_BLOCK / BLOB_GASPRICE_UPDATE_FRACTION) ≈ 1.125` 的最大变化率为目标。

### 吞吐量

`TARGET_BLOB_GAS_PER_BLOCK` 和 `MAX_BLOB_GAS_PER_BLOCK` 的值被选择为对应于每个区块的目标为 3 个 blob（0.375 MB）和最大为 6 个 blob（0.75 MB）。这些较小的初始限制旨在最小化此 EIP 对网络造成的压力，并且预计在未来的升级中会增加，以便网络在更大的区块下展示可靠性。

## 向后兼容性

### Blob 非可访问性

此 EIP 引入了一种具有不同内存池版本和执行负载版本的交易类型，两者之间只能单向转换。blob 存储在网络表示中，而不是共识表示；相反，它们与信标区块相关联。这意味着现在有一部分交易将无法从 web3 API 访问。

### 内存池问题

blob 交易在内存池层具有较大的数据大小，这构成了内存池 DoS 风险，尽管这并不是一个前所未有的风险，因为这也适用于具有大量 calldata 的交易。

通过仅广播 blob 交易的公告，接收节点将能够控制接收哪些以及接收多少交易，从而允许它们将吞吐量限制在可接受的水平。
[EIP-5793](./eip-5793.md) 将通过扩展 `NewPooledTransactionHashes` 公告消息以包括交易类型和大小，为节点提供进一步细粒度的控制。

此外，我们建议将内存池交易替换规则的 blob gasprice 增加要求设为 1.1 倍。

## 测试用例

待定

## 安全考虑

此 EIP 最大程度地增加了信标区块的带宽要求，最大约为 ~0.75 MB。这比今天区块的理论最大大小（30M gas / 16 gas 每个 calldata 字节 = 1.875M 字节）大 40%，因此它不会大幅增加最坏情况下的带宽。
合并后，区块时间是静态的，而不是不可预测的泊松分布，这给了大区块传播的保证时间。

与减少 calldata 成本的替代方案相比，此 EIP 的持续负载要低得多，即使 calldata 受限，因为没有现有软件永久存储 blob，并且没有期望需要像执行负载一样长时间存储它们。这使得更容易实施这样的政策，即这些 blob 应在例如 30-60 天后删除，与提议的（但尚未实施）执行负载历史的一年轮换时间相比，这是一个更短的延迟。

## 版权

通过 [CC0](../LICENSE.md) 放弃版权和相关权利。
