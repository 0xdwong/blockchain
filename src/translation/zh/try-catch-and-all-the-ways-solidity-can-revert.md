本文描述了调用智能合约时可能发生的各种错误，以及 Solidity 的 Try / Catch 块如何响应（或未能响应）这些错误。

要理解 Solidity 中的 Try / Catch 如何工作，我们必须了解当[低级调用](https://www.rareskills.io/post/low-level-call-solidity)失败时返回的数据。编译器决定了这种行为，而不是以太坊虚拟机（EVM）。因此，用其他语言或汇编编写的合约不一定会遵循这里解释的所有错误格式。

当对外部合约的低级调用失败时，它返回一个布尔值`false`。这个`false`表示调用未成功执行。调用在以下情况下可能返回`false`：

*   被调用的合约回滚
    
*   被调用的合约执行非法操作（如除以零或访问越界数组索引）
    
*   被调用的合约耗尽所有 gas
    

在允许自毁已部署合约的 EVM 兼容链上[自毁](https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html#deactivate-and-self-destruct)合约不会导致低级调用返回`false`。

在以下部分中，我们将检查 10 种可能导致低级调用返回 false 的情况，以及它们可能提供的任何返回数据。

然后我们将探讨 Try / Catch 如何处理（或未能处理）每种情况。

## 第1部分：在回滚时返回什么内容

## 1. 如果使用了没有错误字符串的`revert`，会返回什么？

使用`revert`的最简单方法是不提供回滚原因。
```
contract ContractA {
    function mint() external pure {
        revert();
    }
}
```
如果我们部署上述合约（`ContractA`）并从另一个合约（`ContractB`）进行低级调用`mint()`函数，如下所示：
```
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

contract ContractB {
    function call_failure(address contractAAddress) external {
        (, bytes memory err) = [contractAAddress](http://contractaaddress.call/)[.](http://contractaaddress.call/)[call](http://contractaaddress.call/)(
            abi.encodeWithSignature("mint()")
        );

        console.logBytes(err);
    }
}
```
`revert()`错误将被触发，不会返回任何数据，如下图所示：

![revert with no error string return data in hexadecimal format: 0x](https://img.learnblockchain.cn/attachments/migrate/1722220937702)

在上图中，我们可以看到错误返回的数据是`0x`，这只是没有附带数据的十六进制表示。

## 2. 从带有错误字符串的`revert`中返回什么？

另一种使用`revert`的方法是提供一个字符串消息。这有助于识别合约中交易失败的原因。

让我们触发一个带有字符串的回滚，看看返回了什么：

```
contract ContractB {

    function mint() external pure {
        revert("Unauthorized");
    }

}
```

调用合约将是：

```
import "hardhat/console.sol";

contract ContractA {
    function call_failure(address contractBAddress) external {
        (, bytes memory err) = [contractBAddress](http://contractbaddress.call/)[.](http://contractbaddress.call/)[call](http://contractbaddress.call/)(
            abi.encodeWithSignature("mint()")
        );

        console.logBytes(err); // just so we can see the error data
    }
}
```
如果我们部署两个合约并使用`ContractB`的合约地址执行`ContractA`，我们应该得到以下结果：

![revert with a string argument returns the ABI encoding of the Error function Error(string) ](https://img.learnblockchain.cn/attachments/migrate/1722220937708)

当`revert`带有字符串参数触发时，它会将 Error 函数`Error(string)`的 ABI 编码返回给调用者。

我们回滚的返回数据将是[*函数调用的 ABI 编码*](https://www.rareskills.io/post/abi-encoding) `Error("Unauthorized")`。

在这种情况下，它将具有`Error(string)`函数的[函数选择器](https://www.rareskills.io/post/function-selector) ，字符串的偏移量，长度和字符串内容的十六进制编码。

![ABI encoding of Error("Unauthorized")](https://img.learnblockchain.cn/attachments/migrate/1722220937704)

让我们进一步解释输出：

*   选择器`08c379a0`是`keccak256("Error(string)")`的前四个字节，其中 string 指的是原因字符串。接下来的 96 个字节（3 行）是字符串`Unauthorized`的[ABI 编码](https://www.rareskills.io/post/abi-encoding)
    
*   前 32 个字节是字符串长度位置的偏移量。
    
*   第二个 32 个字节是字符串的长度（12 个字节以十六进制表示为`c`）
    
*   字符串`Unauthorized`的实际内容以 UTF-8 编码为字节`556e617574686f72697a6564`
    

## 3. 从自定义`revert`中返回什么？


[Solidity 0.8.4](https://github.com/ethereum/solidity/releases/tag/v0.8.4)引入了错误类型，可以与 revert 语句一起使用，以创建既可读又节省 gas 的自定义错误。

要创建自定义错误类型，你将使用关键字 error 来定义错误，类似于定义[事件](https://www.rareskills.io/post/ethereum-events) ：

```
error Unauthorized();
```

如果需要强调错误信息的一些细节，你也可以定义带有参数的自定义错误：`error CustomError(arg1, arg2, etc)`。

```
error Unauthorized(address caller);
```

### 没有参数的自定义`revert`

让我们比较一个带参数的自定义回滚与一个不带参数的例子：

```
pragma solidity >=0.8.4;

error Unauthorized();

contract ContractA {

    function mint() external pure {
        revert Unauthorized();
    }

}
```

在上述例子中，我们希望回滚交易并返回错误`Unauthorized`。我们的调用合约将保持不变：

```
import "hardhat/console.sol";

contract ContractB {

    function call_failure(address contractAAddress) external {
        (, bytes memory err) = [contractAAddress](http://contractaaddress.call/)[.](http://contractaaddress.call/)[call](http://contractaaddress.call/)(
            abi.encodeWithSignature("mint()")
        );

        console.logBytes(err); // just so we can see the error data
    }
}
```

不带参数的自定义回滚将仅返回函数选择器（`keccak256("Unauthorized()")`的前四个字节）给调用者，即`0x82b42900`。

![Custom revert without arguments return the function selector, 0x82b42900](https://img.learnblockchain.cn/attachments/migrate/1722220937699)

### 带参数的自定义`revert`

如果你的自定义`revert`带有参数，它将返回自定义错误函数调用的 ABI 编码。这里是一个例子：

```
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4;

error Unauthorized(address caller);

contract ContractA {

    function mint() external view {
        revert Unauthorized(msg.sender);
    }

}
```

调用合约将保持不变，错误的结果将如下所示：

![Custom revert with arguments return value](https://img.learnblockchain.cn/attachments/migrate/1722220937710)

它仅包含自定义错误`Unauthorized(address)`的 ABI 编码。编码包括函数选择器和地址参数。由于地址是静态类型，其编码是直接的。

结构如下：

*   前四个字节表示函数选择器：`0x8e4a23d6`
    
*   接下来的 32 个字节表示调用者的地址：`0000000000000000000000009c84abe0d64a1a27fc82821f88adae290eab5e07`
    

顺便提一下，你不能定义自定义错误`error Error(string)`或`error Panic(uint256)`，因为这些与`require`和`assert`分别返回的错误冲突（我们将在后面的部分讨论`assert`）。

## 4.由于`require`语句的`revert`返回什么？

`require`语句是另一种触发回滚而不使用 if 语句的方法。例如，代替编写：

```
if (msg.sender != owner) {
   revert();
}
```

你可以使用`require`语句如下：

```
require(msg.sender == owner);
```

当 `require(false)` 被调用而没有错误信息时，它会回滚交易且没有数据，类似于 `revert()`。结果输出是一个空的数据负载 (`0x`)。

![require statement without error message revert return value](https://img.learnblockchain.cn/attachments/migrate/1722220939810)

类似于带字符串的 `revert`，当 `require` 带有字符串如 `require(false, "Unauthorized")` 被触发时，它返回错误函数 `Error(string)` 的 ABI 编码。

## 5. `require(false, CustomError())` 返回什么？

自 2024 年 5 月 21 日起，自定义错误已被引入 `require` 语句；然而，目前它们只能通过 [*via-ir*](https://docs.soliditylang.org/en/v0.8.26/ir-breaking-changes.html) 使用。（参见这个 [*Solidity 团队描述 via-ir 的视频*](https://www.youtube.com/watch?v=3ljewa1\__UM\&list=PLX8x7Zj6VeznJuVkZtRyKwseJdrr4mNsE)）。

> [via-ir](https://docs.soliditylang.org/en/v0.8.26/ir-breaking-changes.html) [在 Solidity 中](https://docs.soliditylang.org/en/v0.8.26/ir-breaking-changes.html) 是一个使用 Yul 中间表示（IR）来优化 Solidity 代码的编译管道。它默认未启用，因此你需要使用 `--via-ir` 标志与 [solc](https://github.com/ethereum/solc-js) 或在你喜欢的开发环境中配置它。

### 在 Foundry 中启用 via-ir

如果你使用 [Foundry](https://www.rareskills.io/post/foundry-testing-solidity)，只需在 `foundry.toml` 配置文件中将 `via-ir` 设置为 `true` 来激活它，如下所示：

```
[profile.default]
…
via-ir = true
```

### 在 Hardhat 中启用 via-ir

在 HardHat 中，添加 `viaIR:true` 到你的 `hardhat.config` 文件，如下所示：

```
module.exports = {
  solidity: {
    settings: {
      viaIR: true,
    },
  },
};
```

### 在 Remix 中启用 via-ir

如果你使用 [Remix](https://remix.ethereum.org/)，你需要在高级编译器配置设置中启用配置文件，如下图所示：

![how to enabe via-ir in remix](https://img.learnblockchain.cn/attachments/migrate/1722220939840)

在根目录中创建一个空的 `compiler_config.json` 文件。并在配置中添加路径，如上图所示。

一旦启用了“使用配置文件”选项，更新配置文件以在设置中包含 `"viaIR":true`，如下所示。你可能会遇到一些 lint 错误，但你的代码将成功编译。

![setting the `"viaIR":true` in the configuration json file](https://img.learnblockchain.cn/attachments/migrate/1722220939882)

完成后，你可以像这样使用 `require` 编写自定义错误：

```
require(msg.sender == owner, Unauthorized());
```

这与以下内容相同：

```
if (msg.sender != owner) {
    revert Unauthorized();
}
```

是的，它返回的输出与我们已经讨论过的自定义回滚相同。

## 6. `assert` 返回什么？

当 `assert` 语句失败时，它会触发 `Panic(uint256)` 错误。返回值是函数选择器（`keccak256("Panic(uint256)")` 的前四个字节）和错误代码的串联。

以下代码将用于说明这一点，请注意 `contractB` 中的 `assert`：

```
import "hardhat/console.sol";

contract ContractB {
    function mint() external pure {
        assert(false); // we will test what this returns
    }

}

contract ContractA {
    function call_failure(address contractBAddress) external {
        (, bytes memory err) = [contractBAddress](http://contractbaddress.call/)[.](http://contractbaddress.call/)[call](http://contractbaddress.call/)(
            abi.encodeWithSignature("mint()")
        );

        console.logBytes(err);
    }
}
```

当我们部署并执行合约时，我们会得到如下所示的断言错误：

![assert error return value](https://img.learnblockchain.cn/attachments/migrate/1722220939901)

`err` 将包含以下数据：

```
0x4e487b71 // <- the function selector
0000000000000000000000000000000000000000000000000000000000000001 // the error code
```

`4e487b71` 是 `keccak256("Panic(uint256)")` 的前四个字节，其中 `uint256` 指的是错误代码。在这种情况下，错误代码是 `1`。我们将在下一节中看到其他错误代码。

## 7. 非法操作返回什么？

就像 `assert` 语句一样，当发生非法操作如除以零、弹出空数组或数组越界错误时，交易会 panic 并返回函数选择器（`keccak256("Panic(uint256)")` 的前四个字节）和 `uint256` 错误代码的串联。

这是一个非法操作的例子；数组越界——下面 `ContractB` 中的 `outOfbounds()` 函数在 `numbers` 数组中只有 3 个元素。

```
import "hardhat/console.sol";

contract ContractB {
    uint256[] numbers;

    constructor() {
        numbers.push(1);
        numbers.push(2);
        numbers.push(3);
    }

    function outOfbounds(uint256 index) public view returns (uint256) {
        return numbers[index];
    }
}

contract ContractA {

    function call_failure(address contractBAddress) external {
        (, bytes memory err) = [contractBAddress](http://contractbaddress.call/)[.](http://contractbaddress.call/)[call](http://contractbaddress.call/)(
            abi.encodeWithSignature("outOfbounds(uint256)", 10)
        );

        console.logBytes(err);
    }
}
```

如果我们尝试访问第 10 个项目——当然，它不存在，我们会得到数组越界错误：

![Illegal array access operation error, out-of-bound error: 0x32](https://img.learnblockchain.cn/attachments/migrate/1722220939998)

`err` 将包含：

```
0x4e487b71 //<- function selector for Panic(uint256)
0000000000000000000000000000000000000000000000000000000000000032 // <-the error code
```

`0x32` 是数组越界错误的错误代码。

这是另一个例子，如果我们尝试除以零会怎样？

```
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract ContractB {

    function divide(uint256 a, uint256 b) public pure returns (uint256) {
        return a / b;
    }

}
```

然后调用带有参数 `10` 和 `0` 的函数 `divide`：

```
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

contract ContractA {

    function call_failure(address contractBAddress) external {

        (, bytes memory err) = [contractBAddress](http://contractbaddress.call/)[.](http://contractbaddress.call/)[call](http://contractbaddress.call/)(
            abi.encodeWithSignature("divide(uint256, uint256)", 10, 0)
        );

        console.logBytes(err);
    }
}
```

结果将是相同的函数选择器，以及除以零的错误代码 `0x12`。

![illegal division by zero error: 0x12](https://img.learnblockchain.cn/attachments/migrate/1722220940646)

## 8. Solidity 级别与汇编级别的除以零返回什么？

Solidity 级别的除以零会触发一个错误代码为 18（0x12）的回滚。然而，汇编级别的除以零不会回滚，而是返回 0。这是因为编译器在 Solidity 级别插入了检查，而在汇编级别没有。

![Division by zero error return value in solidity (18) vs assembly (0)](https://img.learnblockchain.cn/attachments/migrate/1722220940696)

如果你在汇编级别执行除法操作，请确保检查分母。如果它是零，触发回滚以回滚交易。

```
function divideByZeroInAssembly(uint256 numerator, uint256 denominator)
        public
        pure
        returns (uint256 result)
{
    assembly {
        if iszero(denominator) {
            revert(0, 0)
    	}
        
	result := div(numerator, denominator)
   }
}
```

但这个错误不会像 Solidity 中的常规除以零那样处理，后者会 panic 并抛出以十进制的 18 或十六进制的 0x12 错误代码。

如果你使用 OpenZeppelin，你可以利用 OZ [自定义 Panic 实用程序](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Panic.sol) 来触发带有自定义错误代码的 Panic，如下所示：

![how to use OZ's custom Panic Library with error code 0x12 (18 in decimals)](https://img.learnblockchain.cn/attachments/migrate/1722220940808)

通过这种方式，你可以模拟 Solidity 级别 `assert` 的正常行为。

### 错误代码

![List of error codes referring to the different kinds of panics in Solidity](https://img.learnblockchain.cn/attachments/migrate/1722220941097)

## 9. 什么会在 out-of-gas 时返回？

在低级调用中的 out-of-gas 错误情况下，调用合约不会返回任何内容。没有数据，也没有错误消息。

```
contract E {

    function outOfGas() external pure {
        while (true) {}
    }

}

contract C {

    function call_outOfGas(address e) external returns (bytes memory err) {
        (, err) = [e](http://e.call/)[.](http://e.call/)[call](http://e.call/){gas: 2300}(abi.encodeWithSignature("outOfGas()"));
    }

}
```

变量 `err` 将为空。由于 [63/64 的 gas 规则](https://www.rareskills.io/post/eip-150-and-the-63-64-rule-for-gas)，合约 `C` 仍将剩余原始 gas 的 1/64，因此即使尝试将所有可用的 gas 转发给合约 `E`，对函数 `call_outOfGas` 的调用本身也不一定会因为 out-of-gas 而回滚。

## 10. 什么会在汇编回滚时返回？

相比于 Solidity 回滚，使用汇编回滚可以在 gas 方面更高效地返回错误数据。

汇编中的 `revert` 需要两个参数：一个内存槽和数据的字节大小：

```
revert(startingMemorySlot, totalMemorySize)
```

你可以完全控制从汇编回滚返回的错误数据。例如，我们可以选择使用从 [delegatecall](https://www.rareskills.io/post/delegatecall) 返回的错误消息进行回滚，通过使用 `returndatasize()` 来确定返回数据的总内存大小，就像 OpenZeppelin Proxy.sol 所做的那样：

```
function _delegate(address implementation) internal {
    assembly {
        calldatacopy(0, 0, calldatasize())

        let result := delegatecall(
            gas(),
            implementation,
            0,
            calldatasize(),
            0,
            0
       )

        returndatacopy(0, 0, returndatasize())
        if iszero(result) {
            revert(0, returndatasize())
        }

        return(0, returndatasize())
    }
}
```

使用低级汇编，让我们模拟 Solidity 的回滚语句及其返回数据，以更好地理解汇编回滚中返回数据的结构。

### 模拟没有原因字符串的回滚

类似于 Solidity 中的 `revert()`，`revert(0,0)` 是内联汇编中的等价物。它不会返回任何错误数据，因为起始内存槽定义为 0，数据大小为 `0`，这表明不应返回任何数据。

```
contract ContractB {

    function revertWithAssembly() external pure {
        assembly {
            revert(0, 0) // no returned data
        }
    }
}
```

### 模拟带有原因字符串的回滚

在 Solidity 中带有原因的回滚 — `revert(string)` 涉及多个底层步骤：

*   `Error(string)` 的 ABI 编码
    
*   分配内存以存储字符串元数据，如长度和偏移量
    
*   分配内存以存储实际字符串
    

所有这些步骤都会增加 gas 成本。

为了优化 gas 成本，你可以使用汇编实现类似的功能。这种方法减少了所需的步骤和操作码，因为我们知道并控制数据的存储方式，同时仍然返回相同的错误数据。在下面的示例中，我们手动操作内存并直接存储：

*   `Error(string)` 的函数选择器 — 我们可以在合约外获取选择器并直接使用。我在示例中添加了编码以便于理解。
    
*   偏移量
    
*   字符串长度
    
*   实际字符串
    
*   并触发回滚
    

```
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract ContractB {
    function revertwithAssembly() external pure {
        bytes4 selector = bytes4(abi.encodeWithSignature("Error(string)")); //selector with leading zeros

        assembly {
            mstore(0x00, selector) //- Store the function selector for `Error(string)`
            mstore(0x04, 0x20) //- Store the offset to the error message string
            mstore(0x24, 0xc) //- Store the length of the error message string
            mstore(0x44, "Unauthorized") //- Store the actual error message
            revert(0x00, 0x64) //- Trigger the revert revert(StartingMemorySlot, totalMemorySize)
        }
    }
}
```

当我们从这个外部合约调用合约时：

```
import "hardhat/console.sol";

contract ContractA {
    function call_failure(address contractBAddress)
        external
        returns (bytes memory err)
    {
        (, err) = [contractBAddress](http://contractbaddress.call/)[.](http://contractbaddress.call/)[call](http://contractbaddress.call/)(
            abi.encodeWithSignature("revertwithAssembly()")
        );

        console.logBytes(err);
    }
}
```

结果将是十六进制编码的数据：

![带有原因字符串的回滚（revert(reason)）remix 输出](https://img.learnblockchain.cn/attachments/migrate/1722220941102)

这与我们使用 Solidity `revert(string)` 时得到的结果相同

### 模拟自定义错误的回滚

我们可以使用汇编模拟自定义回滚，以进一步节省 gas。汇编中的自定义回滚返回的函数选择器与 Solidity 自定义回滚相同。

然而，不同于 Solidity 中的自定义错误的完整编码，我们可以省略该步骤，只需直接存储选择器并触发回滚。

```
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

contract ContractB {
    function customRevertWithAssembly() external pure {
        bytes32 selector = bytes32(abi.encodeWithSignature("Unauthorized()"));

        assembly {
            mstore(0x00, selector) //- Store the function selector for the custom error

            revert(0x00, 0x04)
        }
    }
}

contract ContractA {
    function call_failure(address contractBAddress)
        external
        returns (bytes memory err)
    {
        (, err) = [contractBAddress](http://contractbaddress.call/)[.](http://contractbaddress.call/)[call](http://contractbaddress.call/)(
            abi.encodeWithSignature("customRevertWithAssembly()")
        );

        console.logBytes(err);
    }
}
```

当我们运行它时，我们应该看到选择器作为返回值，如下所示：

![带有自定义错误的回滚 remix 输出](https://img.learnblockchain.cn/attachments/migrate/1722220941433)

### Solidity 合约回滚的所有方式总结

当一个交易通过带有原因字符串的 `require` 语句或包含字符串的 `revert` 回滚时，错误的返回值是 `Error(string)` 的选择器，后跟原因字符串的 ABI 编码。

当一个交易由于 `assert` 或非法操作而回滚时，错误数据是 `Panic(uint256)` 的选择器，后跟错误代码的 ABI 编码为 `uint256`。

错误数据为空的情况：

*   交易通过没有原因字符串的 `require()` 或 `revert()` 语句回滚
    
*   被调用的合约用尽了 gas
    
*   被调用的合约使用汇编并通过 `revert(0, 0)` 回滚
    

## 第 2 部分：`try/catch` 如何处理每种情况

在本指南的第一部分中，我们已经看到了不同回滚返回错误的不同方式。现在，让我们探讨 Solidity 中的 `try/catch` 语句如何处理这些情况。

`try/catch` 语句提供了一种结构化的方法来处理外部函数调用或交互过程中可能发生的异常，而不会回滚并撤销整个交易。然而，如果发生错误，被调用合约中的状态更改仍会回滚。

### try/catch 语句

这是一个典型的 `try/catch` 语句结构。请注意，这是模式匹配 Solidity 可以回滚的所有方式：

```
function callContractB() external view {
    try functionFromAnotherContract() {
        //<-- Handle the success case if needed
    } catch Panic(uint256 errorCode) {
        //<-- handle Panic errors
    } catch Error(string memory reason) {
        //<-- handle revert with a reason
    } catch (bytes memory lowLevelData) {
        //<-- handle every other errors apart from Panic and Error with a reason
    }
}
```

我们之前讨论的不同类型的回滚可以根据其返回值在 `try/catch` 块的不同部分中捕获。

`catch Error(string memory reason)` 块处理所有带有原因字符串的回滚。这意味着，`revert(string)` 和 `require(false, "reason")` 错误将在这里被捕获。这是因为这些错误在触发时返回 `Error(string)` 错误。

`catch Panic(uint256 errorCode)` 将捕获所有非法操作，例如在 Solidity 级别的除以零错误，以及 `assert` 错误，因为这些错误在触发时返回 `Panic(uint256 errorCode)`。

最后，任何其他不返回 Panic 或 Error 的错误将被捕获在通用 catch 块 `catch (bytes memory lowLevelData)` 中，包括自定义错误和没有消息字符串的错误。

如果你对错误数据不感兴趣，也可以使用 `catch{ }` 块。这将捕获来自被调用合约的任何错误。

让我们看一个 `try/catch` 语法的示例。在这个简单的示例中，我们将尝试模拟不同类型的错误，并编写一个 `try/catch` 来根据其错误返回值处理它们。

```
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract ContractB {

    error CustomError(uint256 balance);

    uint256 public balance = 10;

    function decrementBalance() external {
        require(balance > 0, "Balance is already zero");
        balance -= 1;
    }

    function revertTest() external view {
        if (balance == 9) {
            // revert without a message
            revert();
        }

        if (balance == 8) {
            uint256 a = 1;
            uint256 b = 0;
            // This is an illegal operation and should cause a panic (Panic(uint256)) due to division by zero
            a / b;
        }

        if (balance == 7) {
            // revert with a message
            revert("not allowed");
        }

        if (balance == 6) {
            // revert with a message
            revert CustomError(100);
        }
    }
}
```

我们处理这些错误的 try/catch 块调用将如下所示：

```
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";
import {ContractB} from "contracts/revert/contractB.sol";

contract ContractA {

    event Errorhandled(uint256 balance);

    ContractB public contractB;

    constructor(address contractBAddress) {
        contractB = ContractB(contractBAddress);
    }

    function callContractB() external view {

        try contractB.revertTest() {
            // Handle the success case if needed
        } catch Panic(uint256 errorCode) {
            // handle illegal operation and `assert` errors
            console.log("error occurred with this error code: ", errorCode);
        } catch Error(string memory reason) {
            // handle revert with a reason
            console.log("error occured with this reason: ", reason);
        } catch (bytes memory lowLevelData) {
            // revert without a message
            if (lowLevelData.length == 0) {
                console.log("revert without a message occured");
            }

            // Decode the error data to check if it's the custom error
            if (                bytes4(abi.encodeWithSignature("CustomError(uint256)")) ==                bytes4(lowLevelData)
            ) {
                // handle custom error
                console.log("CustomError occured here");
            }
        }
    }
}
```

在每个 catch 块中，我们模拟了不同类型错误的处理。为了更好地理解，我添加了注释来解释每个块中发生的事情。

注意，没有像 `catch CustomError {}` 这样的 catch 块。相反，我们在通用 catch-all 块中手动处理它，因为目前还没有官方的方法来解码自定义错误。

关于这一点有一个[开放问题](https://github.com/ethereum/solidity/issues/11278)，其中有很多关于如何通过在最终 catch 块中添加 `if` 语句来匹配选择器的建议。`try/catch` [发布博客](https://soliditylang.org/blog/2020/01/29/solidity-0.6-try-catch/)中提到，未来计划改进 try/catch 语句以正确处理自定义错误。![通过 solidity 捕捉未来计划](https://img.learnblockchain.cn/attachments/migrate/1722220941484)

在我们的例子中，我们检查了低级错误数据是否对应我们试图捕捉的特定自定义错误签名。

```
if (bytes4(abi.encodeWithSignature("CustomError(uint256)")) == bytes4(lowLevelData)
){}
```

## 哪些场景下 try/catch 无法处理你的错误？

由于`try / catch`语法只捕捉外部合约的错误：

### 1) 在 try 或 catch 块内（在调用合约中）发生的任何错误都不会被捕捉。

例如，这张图片中的任何回滚都不会被捕捉（ [通过 remix 运行](https://remix.ethereum.org/#activate=solidity,fileManager&gist=a46e9078e8373bec1cbe5a800b9a1a53&call=fileManager//open//a46e9078e8373bec1cbe5a800b9a1a53/uncatchableTryCatch.sol&lang=en&optimize=false&runs=200&evmVersion=null&version=soljson-v0.8.26+commit.8a97fa7a.js) )：

![try 或 catch 块在调用合约中不会捕捉的错误示例](https://img.learnblockchain.cn/attachments/migrate/1722220941951)

### 2) 如果合约没有正确类型的“catch”

例如，如果合约因 panic 回滚但只有一个错误捕捉块而没有通用捕捉块，如下图所示（ [通过 Remix 运行](https://remix.ethereum.org/#activate=solidity,fileManager&gist=d0385aba51a85defb784282f7bd2c55f&call=fileManager//open//gist-d0385aba51a85defb784282f7bd2c55f/theRightKindOfCatch.sol) )：

![合约有错误类型的“catch”示例](https://img.learnblockchain.cn/attachments/migrate/1722220942007)

### 3) 当接口期望返回数据但没有提供时回滚

如果定义调用其他合约的接口期望返回数据，而合约没有返回任何数据，或者返回的数据格式不符合预期，整个交易将回滚并且不会被捕捉，如下例所示（ [通过 Remix 运行](https://remix.ethereum.org/#activate=solidity,fileManager&gist=b14fbe071b4ef64439dc995d72f51032&call=fileManager//open//gist-b14fbe071b4ef64439dc995d72f51032/noReturnValue.sol) )：

![当接口期望返回数据但没有提供时回滚](https://img.learnblockchain.cn/attachments/migrate/1722220942165)

## Solidity 中`try/catch`的问题

`try/catch`的问题一直是一个[讨论话题](https://forum.soliditylang.org/t/call-for-feedback-the-future-of-try-catch-in-solidity/1497) ，有很多建议，我们在本指南中已经看到了一些。

讨论中突出的几个问题包括：

### 语法带来的错误期望

有一种误解认为`try/catch`语法在 Solidity 中像其他语言一样工作，但实际上并不是。例如，你可能会期望以下代码流程应该工作。

```
try <expression> {
   revert();
} catch {
     // also handle the revert in the try block
}
```

但它不会按预期工作。catch 块不会捕捉回滚。它将终止整个交易。

### 缺乏处理编译器生成检查中回滚的机制

当我们从另一个合约调用一个函数时，Solidity 编译器会对被调用合约执行几个检查，例如：

*   检查目标合约的`extcodesize`以检查[目标是否是合约](https://www.rareskills.io/post/solidity-code-length) 。如果地址不是合约，则失败。
    
*   检查`returndatasize`——如果方法期望返回一些数据，它会验证`returndatasize`是否不为空。如果有返回值，它会解码并验证它们是否正确编码。
    
*   它还进行编码和解码检查。调用者还会尝试对返回的数据进行 ABI 解码，如果数据格式错误或不存在，则会回滚。
    

如果这些检查中的任何一个失败，try/catch 语法将不会捕捉错误。

### 缺少功能

除了`catch Panic(uint256 errorCode)`和`catch Error(string memory reason)`之外，允许你捕捉自定义错误如`catch CustomError()`的功能是 try/catch 语法中自然期望的功能。然而，没有这些错误情况的语法，它们必须在 catch 块中手动处理。

## 对 Solidity 中`try/catch`问题的建议解决方案

从我们之前提到的[提案讨论](https://forum.soliditylang.org/t/call-for-feedback-the-future-of-try-catch-in-solidity/1497) ，这是一个简要总结，这些建议的解决方案在撰写本文时尚未实现：

*   扩展`try/catch`语法，增加明确定义你正在处理的错误类型的功能。例如，`internal` catch 将处理由编译器添加的额外检查触发的本地回滚（它仍然不会捕捉在同一个合约中触发的回滚），而`external` catch 将继续使用现有的 catch 实现。
    
*   添加新的 catch 子句用于本地回滚，如
    
*   catch NoContract {}
    
*   catch DecodingFailure {}
    
*   catch Other {}  
    
*   `tryCall()`和`match`——此功能预计将在外部函数上运行模式匹配，并允许你根据结果和错误类型在 match 结构的不同分支中处理各种错误。以下是[`提案`](https://forum.soliditylang.org/t/call-for-feedback-the-future-of-try-catch-in-solidity/1497)中的一个示例：
    

```
import { tryCall } from "std/errors";
error MyError(string);

match tryCall(token.transfer, (exampleAddress, 100)) {
    CallSuccess(transferSuccessful) => {
        ...
    }
    
    CallFailure(MyError(reason)) => {
        ...
    }
    NotAContract => {
        ...
    }
    
    DecodingFailure(errorCode) => {
        ...
    }
}
```

该提案发布于 2023 年 2 月。因此，我们期待未来实施的解决方案。

## 结论

当 Solidity 合约回滚时，它可以返回一个 ABI 编码的`Error(string)`、`Panic(uint256)`、一个 4 字节的自定义错误，或者什么都不返回。try-catch 有捕捉`Error(string)`、`Panic(uint256)`和一个通用`catch`的机制。它不能原生处理自定义错误。

如果调用者回滚或被调用者返回的数据格式不符合调用者的预期（例如尝试解析空或格式错误的数据），try catch 将失败。

## 作者

本文由 [Eze Sunday](https://www.linkedin.com/in/ezesundayeze/) 与 RareSkills 合作撰写。