# `Coin`资源和`create_currency`方法

现在，我们知道了泛型和见证模式是如何工作的，让我们再来看看`Coin`资源和`create_currency`方法。

## `Coin`资源

现在我们了解了泛型是如何工作的，我们可以重新审视一下 "sui::coin "中的 "Coin "资源。它被[定义](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/sources/coin.move#L29)为以下内容。

```rust
struct Coin<phantom T> has key, store {
        id: UID,
        balance: Balance<T>
    }
```

`Coin`资源类型是一个结构，有一个通用类型`T`和两个字段，`id`和`balance` 。`id`是`sui::object::UID`类型，我们之前已经看到过了。

`balance`是`sui::balance::Balance`类型，并且[定义](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/sources/balance.move#L25)为：

```rust 
struct Balance<phantom T> has store {
    value: u64
}
```

回顾我们关于[phantom](<https://github.com/sui-foundation/sui-move-intro-course/blob/main/unit-three/lessons/3_witness_design_pattern.md#the-phantom-keyword>)讨论，`T`类型在`Coin`中只作为`Balance`的另一个phantom类型的参数，而在`Balance`中，它没有用于任何字段，因此`T`是一个`phantom`类型参数。

`Coin<T>`服务于可转移的资产表示，即一定数量的同质化代币类型`T`，可以在地址之间转移或被智能合约函数调用消耗。

## `create_currency` 方法

让我们看看 `coin::create_currency` 在其[源代码](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/sources/coin.move#L251)中实际做了什么：

```rust
    public fun create_currency<T: drop>(
        witness: T,
        decimals: u8,
        symbol: vector<u8>,
        name: vector<u8>,
        description: vector<u8>,
        icon_url: Option<Url>,
        ctx: &mut TxContext
    ): (TreasuryCap<T>, CoinMetadata<T>) {
        // Make sure there's only one instance of the type T
        assert!(sui::types::is_one_time_witness(&witness), EBadWitness);

        // Emit Currency metadata as an event.
        event::emit(CurrencyCreated<T> {
            decimals
        });

        (
            TreasuryCap {
                id: object::new(ctx),
                total_supply: balance::create_supply(witness)
            },
            CoinMetadata {
                id: object::new(ctx),
                decimals,
                name: string::utf8(name),
                symbol: ascii::string(symbol),
                description: string::utf8(description),
                icon_url
            }
        )
    }
```

该语句使用Sui框架中的[sui::types::is_one_time_witness](<https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/sources/types.move>) 方法检查传入的`witness`资源是否是一次性见证。

该方法创建并返回两个对象，一个是`TreasuryCap`资源，另一个是`CoinMetadata`资源。

### `TreasuryCap`

`TreasuryCap`是一种资产，通过一次性见证模式保证是一个单体对象：

```rust
    /// Capability allowing the bearer to mint and burn
    /// coins of type `T`. Transferable
    struct TreasuryCap<phantom T> has key, store {
            id: UID,
            total_supply: Supply<T>
        }
```

它包装了一个类型为`balance::Supply`的singtleton字段`total_supply`：

```rust
/// A Supply of T. Used for minting and burning.
    /// Wrapped into a `TreasuryCap` in the `Coin` module.
    struct Supply<phantom T> has store {
        value: u64
    }
```

`Supple<T>`跟踪当前正在流通的`T`类型的同质化代币的发行总量。你可以看到为什么这个字段必须是一个单体，因为为一个代币类型拥有多个`supply`实例是没有意义的。

### `CoinMetadata`

这是一个存储已创建的可替换代币的元数据的资源。它包括以下字段。

-   `decimals`: 这个自定义可替换代币的精度
-   `name`：这个自定义可替换标记的名称
-   `symbol`：这个自定义可替换标记的标记符号
-   `description`: 这个自定义可替换标记的描述
-   `icon_url': 这个自定义可替换代币的图标文件的网址。

`CoinMetadata`中包含的信息可以被认为是Sui的基本和轻量级的可替换代币标准，可以被钱包和浏览器用来显示使用`sui::coin`模块创建同质化代币。