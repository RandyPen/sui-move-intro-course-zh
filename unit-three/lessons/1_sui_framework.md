

# Sui Framework

智能合约的一个常见用例是发行自定义同质化代币（例如以太坊上的 ERC-20 代币）。让我们来看看如何使用 Sui 框架在 Sui 上完成这项工作，以及一些经典同质化代币的变体。

## Sui Framework

[Sui Framework](https://github.com/MystenLabs/sui/tree/main/crates/sui-framework/sources)是Sui对Move VM功能的具体实现。 它包含 Sui 的原生 API，Move 标准库的实现，以及 Sui 特定的操作，例如[密码原语](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/docs/groth16.md)和 Sui 在Framework级别的[数据结构](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/docs/url.md)的实现。

Sui 中自定义同质化代币的实现将大量使用 Sui Framework中的一些库。

## **`sui::coin`**

我们将在 Sui 上实现自定义同质化代币使用主要的库是 [sui::coin](<https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/docs/coin%20.md>) 模块。

我们将在同质化代币示例中直接使用的资源或方法是：

资源：[Coin](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/docs/coin.md#resource-coin)

资源：[TreasuryCap](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/docs/coin.md#resource-treasurycap)

资源：[CoinMetadata](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/docs/coin.md#resource-coinmetadata)

方法：[coin::create_currency](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/docs/coin.md#function-create_currency)

介绍一些新概念后，我们将更深入地重新审视以上内容。

