# 市场合约

现在我们对各种类型的集合和动态字段的工作原理有了深入的了解，我们可以开始为链上市场编写合约，它可以支持以下功能：

- 列出任意项目类型和数量
- 接受自定义或本地可替代令牌类型的付款
- 可以同时允许多个卖家列出他们的物品并安全地接收付款

## 类型定义

首先，我们定义整体的“Marketplace”结构：

```rust
    /// A shared `Marketplace`. Can be created by anyone using the
    /// `create` function. One instance of `Marketplace` accepts
    /// only one type of Coin - `COIN` for all its listings.
    public struct Marketplace<phantom COIN> has key {
        id: UID,
        items: Bag,
        payments: Table<address, Coin<COIN>>
    }
```

`Marketplace` 将是一个共享对象，任何人都可以访问和更改。 它接受一个 `COIN` 通用类型参数，该参数定义了接受付款的 [同质化代币](../../unit-three/lessons/4_the_coin_resource_and_create_currency.md) 类型。

`items` 字段将保存项目列表，它可以是不同的类型，因此我们在这里使用异构的 `Bag` 集合。

`payments` 字段将保存每个卖家收到的付款。 这可以用一个键值对来表示，其中卖家的地址作为键，接受的硬币类型作为值。 因为这里的key和value的类型是同构的，固定的，所以我们可以对这个字段使用`Table`集合类型。

_测验：您将如何修改此结构以接受多种可替代令牌类型？_

接下来，我们定义一个 `Listing` 类型：

```rust
    /// A single listing which contains the listed item and its
    /// price in [`Coin<COIN>`].
public   struct Listing has key, store {
        id: UID,
        ask: u64,
        owner: address,
    }
```

该结构仅包含我们需要的与项目列表相关的信息。 我们将直接将要交易的实际项目作为动态对象字段附加到 Listing 对象，因此我们不需要在此处显式定义任何项目字段或集合。

注意 `Listing` 具有 `key` 能力，这是因为当我们将它放入集合中时，我们希望能够使用它的对象 ID 作为键。

## Listing and Delisting

接下来，我们编写列出和删除项目的逻辑。 首先，列出一个项目：

```rust
   /// List an item at the Marketplace.
    public entry fun list<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item: T,
        ask: u64,
        ctx: &mut TxContext
    ) {
        let item_id = object::id(&item);
        let listing = Listing {
            ask,
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
        };

        ofield::add(&mut listing.id, true, item);
        bag::add(&mut marketplace.items, item_id, listing)
    }
```

如前所述，我们将简单地使用动态对象字段接口附加任意类型的待售商品，然后我们将 `Listing` 对象添加到 listings 的 `Bag` 中，使用该商品的对象 id 作为 key 和实际的 Listing 对象作为值（这就是为什么 Listing 也有 store 的能力）。

对于下架，我们定义了以下方法：

```rust
   /// Internal function to remove listing and get an item back. Only owner can do that.
    fun delist<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        ctx: &mut TxContext
    ): T {
        let Listing {
            id,
            owner,
            ask: _,
        } = bag::remove(&mut marketplace.items, item_id);

        assert!(tx_context::sender(ctx) == owner, ENotOwner);

        let item = ofield::remove(&mut id, true);
        object::delete(id);
        item
    }

    /// Call [`delist`] and transfer item to the sender.
    public entry fun delist_and_take<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        ctx: &mut TxContext
    ) {
        let item = delist<T, COIN>(marketplace, item_id, ctx);
        transfer::transfer(item, tx_context::sender(ctx));
    }
```

注意下架的 `Listing` 对象是如何解包和删除的，以及通过  [ofield::remove](https://github.com/MystenLabs/sui/blob/e4c459ff522dc2077d3520f99b514e266935047a/crates/sui-framework/sources/dynamic_object_field.move#L67)请记住，Sui 资产不能在其定义模块之外销毁，因此我们必须将项目转移到 delister。

## 采购和付款

购买商品类似于下架，但具有处理付款的额外逻辑。

```rust
    /// Internal function to purchase an item using a known Listing. Payment is done in Coin<C>.
    /// Amount paid must match the requested amount. If conditions are met,
    /// owner of the item gets the payment and buyer receives their item.
    fun buy<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        paid: Coin<COIN>,
    ): T {
        let Listing {
            id,
            ask,
            owner
        } = bag::remove(&mut marketplace.items, item_id);

        assert!(ask == coin::value(&paid), EAmountIncorrect);

        // Check if there's already a Coin hanging and merge `paid` with it.
        // Otherwise attach `paid` to the `Marketplace` under owner's `address`.
        if (table::contains<address, Coin<COIN>>(&marketplace.payments, owner)) {
            coin::join(
                table::borrow_mut<address, Coin<COIN>>(&mut marketplace.payments, owner),
                paid
            )
        } else {
            table::add(&mut marketplace.payments, owner, paid)
        };

        let item = ofield::remove(&mut id, true);
        object::delete(id);
        item
    }

    /// Call [`buy`] and transfer item to the sender.
    public entry fun buy_and_take<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        paid: Coin<COIN>,
        ctx: &mut TxContext
    ) {
        transfer::transfer(
            buy<T, COIN>(marketplace, item_id, paid),
            tx_context::sender(ctx)
        )
    }

```

第一部分与从列表中删除项目相同，但我们还会检查发送的付款金额是否正确。

 第二部分将支付硬币对象插入到我们的`payments` `Table` 中，并且根据卖家是否已经有一些余额，它将执行一个简单的`table::add` 或`table::borrow_mut` 和 `coin::join` 将付款合并到现有余额中。

入口函数 `buy_and_take` 简单地调用 `buy` 并将购买的物品转移给买家。

### 收取利润

最后，我们为卖家定义了从市场中收取余额的方法。

```rust
   /// Internal function to take profits from selling items on the `Marketplace`.
    fun take_profits<COIN>(
        marketplace: &mut Marketplace<COIN>,
        ctx: &mut TxContext
    ): Coin<COIN> {
        table::remove<address, Coin<COIN>>(&mut marketplace.payments, tx_context::sender(ctx))
    }

    /// Call [`take_profits`] and transfer Coin object to the sender.
    public entry fun take_profits_and_keep<COIN>(
        marketplace: &mut Marketplace<COIN>,
        ctx: &mut TxContext
    ) {
        transfer::transfer(
            take_profits(marketplace, ctx),
            tx_context::sender(ctx)
        )
    }
```

_Quiz：为什么我们不需要在这种市场设计下使用基于[Capability](../../unit-two/lessons/6_capability_design_pattern.md) 的访问控制？ 我们可以在这里实现能力设计模式吗？ 这会给市场带来什么特性？_

## 完整合同

您可以在 [`example_projects/marketplace`](../example_projects/marketplace/sources/marketplace.move) 文件夹下找到我们实现的通用市场完整的智能合约。