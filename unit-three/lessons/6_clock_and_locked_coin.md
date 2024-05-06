# 时钟和锁币示例

在第二个同质化代币示例中，我们将介绍如何在 Sui 中获取链上时间，并利用该时间来实现一种币的归属机制。

## 时钟

Sui 框架拥有一个原生的[时钟模块](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/docs/clock.md)，该模块使 Move 智能合约中的时间戳可用。

你需要了解的主要方法是以下的：

```rust
public fun timestamp_ms(clock: &clock::Clock): u64
```

[`timestamp_ms`](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/docs/clock.md#function-timestamp_ms) 函数返回当前系统时间戳，作为从过去某个任意点开始的毫秒总计。

[`clock`](https://github.com/MystenLabs/sui/blob/main/crates/sui-framework/docs/clock.md#0x2_clock_Clock) 对象有一个特殊的保留标识符，`0x6`，需要作为输入之一传递给使用它的函数调用。

## 锁定币

现在我们知道了如何通过 `clock` 访问链上时间，实现一个归属的同质化代币将相对直接。

### `Locker` 自定义类型

`locked_coin` 在 `managed_coin` 的实现基础上增加了一个自定义类型，`Locker`：

```rust
    /// 可转移对象，用于存储归属的硬币
    ///
public struct Locker has key, store {
        id: UID,
        start_date: u64,
        final_date: u64,
        original_balance: u64,
        current_balance: Balance<LOCKED_COIN>

    }
```

Locker 是一个可转移的[资产](https://github.com/sui-foundation/sui-move-intro-course/blob/main/unit-one/lessons/3_custom_types_and_abilities.md#assets)，编码了与发行代币的归属时间表和归属状态相关的信息。

`start_date` 和 `final_date` 是从 `clock` 获得的时间戳，标记了归属期的开始和结束。

`original_balance` 是初始余额发放到 `Locker` 中，`balance` 是当前余额和剩余余额，考虑到任何已经提取的归属部分。

### 铸造

在 `locked_mint` 方法中，我们创建并转移一个 `Locker`，其中编码了指定数量的代币和归属时间表：

```rust
    /// 铸造并转移一个锁定对象，包含输入数量的硬币和指定的归属时间表
    /// 
    public fun locked_mint(treasury_cap: &mut TreasuryCap<LOCKED_COIN>, recipient: address, amount: u64, lock_up_duration: u64, clock: &Clock, ctx: &mut TxContext){
        
        let coin = coin::mint(treasury_cap, amount, ctx);
        let start_date = clock::timestamp_ms(clock);
        let final_date = start_date + lock_up_duration;

        transfer::public_transfer(Locker {
            id: object::new(ctx),
            start_date: start_date,
            final_date: final_date,
            original_balance: amount,
            current_balance: coin::into_balance(coin)
        }, recipient);
    }
```

注意这里是如何使用 `clock` 来获取当前时间戳的。

### 提取

`withdraw_vested` 方法包含了大部分计算归属金额的逻辑：

```rust
    /// 假设线性归属，提取可用的归属金额
    ///
    public fun withdraw_vested(locker: &mut Locker, clock: &Clock, ctx: &mut TxContext){
        let total_duration = locker.final_date - locker.start_date;
        let elapsed_duration = clock::timestamp_ms(clock) - locker.start_date;
        let total_vested_amount = if (elapsed_duration > total_duration) {
            locker.original_balance
        } else {
            locker.original_balance * elapsed_duration / total_duration
        };
        let available_vested_amount = total_vested_amount - (locker.original_balance-balance::value(&locker.current_balance));
        transfer::public_transfer(coin::take(&mut locker.current_balance, available_vested_amount, ctx), sender(ctx))
    }
```

这个示例假设了一个简单的线性归属时间表，但可以修改以适应各种归属逻辑和时间表。

### 完整合约

你可以在 [example_projects/locked_coin](../example_projects/locked_coin/) 文件夹下找到我们实现 [`locked_coin`](../example_projects/locked_coin/sources/locked_coin.move) 的完整智能合约。
