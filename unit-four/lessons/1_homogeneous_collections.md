# Homogeneous Collections

在深入探讨在 Sui 上构建市场这一主题之前，让我们先了解一下 Move 中的集合。

## Vectors

Move 中的 `Vector` 类似于其他语言（如 C++）中的 Vector。它是一种在运行时动态分配内存并管理一组单一类型的方法，可以是特定类型或[通用类型](../../unit-three/lessons/2_intro_to_generics.md)。

需要注意的是，用泛型类型定义的向量可以接受任意类型的对象，集合中的所有对象仍然必须是相同类型，也就是说，集合是同质的。

### 创建vector

任何类型的向量都可以通过 `vector` 字面量和vector的API创建。

```rust
vector<T>[]: vector<T>
vector<T>[e1, ..., en]: vector<T>
```

一个简单的示例：

```rust
const A: vector<u8> = vector[0u8, 1u8, 2u8];
const B: vector<bool> = vector<bool>[false];

(vector[]: vector<bool>);
(vector[0u8, 1u8, 2u8]: vector<u8>);
(vector<u128>[]: vector<u128>);
(vector<address>[@0x42, @0x100]: vector<address>);
```

下面是一个自定义类型的vector，并封装了相关操作函数，请参阅包含的示例代码以 `vector` 的定义以及其基本操作。

```rust
module collection::vector {

    use std::vector;

    public struct Widget {
    }

    // Vector for a specified  type
    public struct WidgetVector {
        widgets: vector<Widget>
    }

    // Vector for a generic type 
    public struct GenericVector<T> {
        values: vector<T>
    }

    // Creates a GenericVector that hold a generic type T
    public fun create<T>(): GenericVector<T> {
        GenericVector<T> {
            values: vector::empty<T>()
        }
    }

    // Push a value of type T into a GenericVector
    public fun put<T>(vec: &mut GenericVector<T>, value: T) {
        vector::push_back<T>(&mut vec.values, value);
    }

    // Pops a value of type T from a GenericVector
    public fun remove<T>(vec: &mut GenericVector<T>): T {
        vector::pop_back<T>(&mut vec.values)
    }

    // Returns the size of a given GenericVector
    public fun size<T>(vec: &mut GenericVector<T>): u64 {
        vector::length<T>(&vec.values)
    }
}

```

更多可以通过movebook查看

## Table

`Table` 是一个映射类的集合，可以动态存储键值对。但与传统的映射集合不同，它的键和值不存储在 `Table` 值中，而是使用 Sui 的对象系统存储。该 `Table` 结构仅充当对象系统的句柄以检索这些键和值。

`Table` 中一个 `key` 的类型必须具有 `copy + drop + store` 的能力约束，并且 `value` 类型必须具有 `store` 的能力约束。

`Table` 也是一种*同构集合*类型，其中键和值字段可以指定或泛型类型，但集合中的所有值和所有键 `Table` 必须是相同的*类型*。

*测验：用运算符检查包含完全相同的键值对的两个表对象是否彼此相等 `===`？试试看。*

有关使用集合的信息，请参见以下示例`Table`：

```rust
module collection::table {
    use sui::table::{Table, Self};
    use sui::tx_context::{TxContext};

    // Defining a table with specified types for the key and value
    public struct IntegerTable {
        table_values: Table<u8, u8>
    }

    // Defining a table with generic types for the key and value 
    public struct GenericTable<phantom K: copy + drop + store, phantom V: store> {
        table_values: Table<K, V>
    }

    // Create a new, empty GenericTable with key type K, and value type V
    public fun create<K: copy + drop + store, V: store>(ctx: &mut TxContext): GenericTable<K, V> {
        GenericTable<K, V> {
            table_values: table::new<K, V>(ctx)
        }
    }

    // Adds a key-value pair to GenericTable
    public fun add<K: copy + drop + store, V: store>(table: &mut GenericTable<K, V>, k: K, v: V) {
        table::add(&mut table.table_values, k, v);
    }

    /// Removes the key-value pair in the GenericTable `table: &mut Table<K, V>` and returns the value.   
    public fun remove<K: copy + drop + store, V: store>(table: &mut GenericTable<K, V>, k: K): V {
        table::remove(&mut table.table_values, k)
    }

    // Borrows an immutable reference to the value associated with the key in GenericTable
    public fun borrow<K: copy + drop + store, V: store>(table: &GenericTable<K, V>, k: K): &V {
        table::borrow(&table.table_values, k)
    }

    /// Borrows a mutable reference to the value associated with the key in GenericTable
    public fun borrow_mut<K: copy + drop + store, V: store>(table: &mut GenericTable<K, V>, k: K): &mut V {
        table::borrow_mut(&mut table.table_values, k)
    }

    /// Check if a value associated with the key exists in the GenericTable
    public fun contains<K: copy + drop + store, V: store>(table: &GenericTable<K, V>, k: K): bool {
        table::contains<K, V>(&table.table_values, k)
    }

    /// Returns the size of the GenericTable, the number of key-value pairs
    public fun length<K: copy + drop + store, V: store>(table: &GenericTable<K, V>): u64 {
        table::length(&table.table_values)
    }

}
```
