# Heterogeneous Collections

像 `Vector` 和 `Table` 这样的同类集合可以用于我们需要保存相同类型对象集合的市场，但是如果我们需要保存不同类型的对象，或者甚至如果我们在编译时不知道我们需要保存的对象是什么类型，那么又该怎么办呢？

对于这种类型的市场，我们需要使用一个异构的集合来保存要出售的商品。 已经完成了理解动态字段的工作原理，Sui 中的异构集合应该很容易理解。我们将在这里更仔细地研究 `Bag` 集合类型。

## `Bag` 类型

`Bag` 是一个异构的类似映射的集合。 该集合类似于`Table`，因为它的键和值同样不存储在`Bag`值中，而是使用 Sui 的对象系统存储。 `Bag` 结构仅充当对象系统的句柄以检索这些键和值。

### 常见的`Bag`操作

常见的“Bag”操作示例代码如下：

```rust
module collection::bag {

    use sui::bag::{Bag, Self};
    use sui::tx_context::{TxContext};

    // Defining a table with generic types for the key and value 
    public struct GenericBag {
       items: Bag
    }

    // Create a new, empty GenericBag
    public fun create(ctx: &mut TxContext): GenericBag {
        GenericBag{
            items: bag::new(ctx)
        }
    }

    // Adds a key-value pair to GenericBag
    public fun add<K: copy + drop + store, V: store>(bag: &mut GenericBag, k: K, v: V) {
       bag::add(&mut bag.items, k, v);
    }

    /// Removes the key-value pair from the GenericBag with the provided key and returns the value.   
    public fun remove<K: copy + drop + store, V: store>(bag: &mut GenericBag, k: K): V {
        bag::remove(&mut bag.items, k)
    }

    // Borrows an immutable reference to the value associated with the key in GenericBag
    public fun borrow<K: copy + drop + store, V: store>(bag: &GenericBag, k: K): &V {
        bag::borrow(&bag.items, k)
    }

    /// Borrows a mutable reference to the value associated with the key in GenericBag
    public fun borrow_mut<K: copy + drop + store, V: store>(bag: &mut GenericBag, k: K): &mut V {
        bag::borrow_mut(&mut bag.items, k)
    }

    /// Check if a value associated with the key exists in the GenericBag
    public fun contains<K: copy + drop + store>(bag: &GenericBag, k: K): bool {
        bag::contains<K>(&bag.items, k)
    }

    /// Returns the size of the GenericBag, the number of key-value pairs
    public fun length(bag: &GenericBag): u64 {
        bag::length(&bag.items)
    }
}
```

如您所见，与 `Bag` 集合交互的函数签名与与 `Table` 集合交互的函数签名非常相似，主要区别在于在创建新的 `Bag` 时不需要声明任何类型，并 添加到其中的键值对类型不需要是相同的类型。
