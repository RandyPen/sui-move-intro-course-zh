# Dynamic Fields

为了了解像 Table 这样的集合在 Sui Move 中是如何实现的，我们需要引入 Sui Move 中动态字段的概念。动态字段是可以在运行时添加或删除的异构字段，并且可以具有任意用户分配的名称。

动态字段有两种子类型：

- **动态字段**：可以存储任何具有`store`能力的值，但是存储在这种字段中的对象将被视为被包装过（例如一个带有key能力的全局对象被嵌套进另一个结构体中），无法通过其直接访问通过外部工具（浏览器、钱包等）访问存储的 ID。
- **动态对象字段**：值必须是 Sui 对象（具有 `key` 和 `store` 能力，以及 `id: UID` 作为第一个字段），但仍然可以通过它们的对象 ID 直接访问被附上。

## 动态字段操作

### 添加动态字段

为了说明如何使用动态字段，我们定义了以下结构：

```rust
   // Parent struct
    public struct Parent has key {
        id: UID,
    }

    // Dynamic field child struct type containing a counter
    public struct DFChild has store {
        count: u64
    }

    // Dynamic object field child struct type containing a counter
    public struct DOFChild has key, store {
        id: UID,
        count: u64,
    }
```

下面是用于向对象添加**动态字段**或**动态对象字段**的 API：

```rust
  module collection::dynamic_fields {

      use sui::dynamic_object_field as ofield;
      use sui::dynamic_field as field;

    // Adds a DFChild to the parent object under the provided name
    public fun add_dfchild(parent: &mut Parent, child: DFChild, name: vector<u8>) {
        field::add(&mut parent.id, name, child);
    }

    // Adds a DOFChild to the parent object under the provided name
    public entry fun add_dofchild(parent: &mut Parent, child: DOFChild, name: vector<u8>) {
        ofield::add(&mut parent.id, name, child);
    } 
  }
```

### 访问和改变动态字段

可以按如下方式读取或访问动态字段和动态对象字段：

```rust
    // Borrows a reference to a DOFChild
    public fun borrow_dofchild(child: &DOFChild): &DOFChild {
        child
    }

    // Borrows a reference to a DFChild via its parent object
    public fun borrow_dfchild_via_parent(parent: &Parent, child_name: vector<u8>): &DFChild {
        field::borrow<vector<u8>, DFChild>(&parent.id, child_name)
    }

    // Borrows a reference to a DOFChild via its parent object
    public fun borrow_dofchild_via_parent(parent: &Parent, child_name: vector<u8>): &DOFChild {
        ofield::borrow<vector<u8>, DOFChild>(&parent.id, child_name)
    }
```

动态字段和动态对象字段也可以像下面这样改变：

```rust
    // Mutate a DOFChild directly
    public entry fun mutate_dofchild(child: &mut DOFChild) {
        child.count = child.count + 1;
    }

    // Mutate a DFChild directly
    public fun mutate_dfchild(child: &mut DFChild) {
        child.count = child.count + 1;
    }

    // Mutate a DFChild's counter via its parent object
    public entry fun mutate_dfchild_via_parent(parent: &mut Parent, child_name: vector<u8>) {
        let child = field::borrow_mut<vector<u8>, DFChild>(&mut parent.id, child_name);
        child.count = child.count + 1;
    }

    // Mutate a DOFChild's counter via its parent object
    public entry fun mutate_dofchild_via_parent(parent: &mut Parent, child_name: vector<u8>) {
        mutate_dofchild(ofield::borrow_mut<vector<u8>, DOFChild>(
            &mut parent.id,
            child_name,
        ));
    }
```

*小测验：为什么 `mutate_dofchild` 可以作为入口函数而不是 `mutate_dfchild` ？*

### 删除动态字段

我们可以从其父对象中删除一个动态字段，如下所示：

```rust
    // Removes a DFChild given its name and parent object's mutable reference, and returns it by value
    public fun remove_dfchild(parent: &mut Parent, child_name: vector<u8>): DFChild {
        field::remove<vector<u8>, DFChild>(&mut parent.id, child_name)
    }

    // Deletes a DOFChild given its name and parent object's mutable reference
    public entry fun delete_dofchild(parent: &mut Parent, child_name: vector<u8>) {
        let DOFChild { id, count: _ } = ofield::remove<vector<u8>, DOFChild>(
            &mut parent.id,
            child_name,
        );
        object::delete(id);
    }

    // Removes a DOFChild from the parent object and transfer it to the caller
    public entry fun reclaim_dofchild(parent: &mut Parent, child_name: vector<u8>, ctx: &mut TxContext) {
        let child = ofield::remove<vector<u8>, DOFChild>(
            &mut parent.id,
            child_name,
        );
        transfer::transfer(child, tx_context::sender(ctx));
    }
```

请注意，对于动态对象字段，我们可以在删除它与另一个对象的附件后删除或转移它，因为动态对象字段是一个 Sui 对象。但是我们不能对动态字段做同样的事情，因为它没有`key`能力，也不是 Sui 对象。

## 动态字段与动态对象字段

什么时候应该使用动态字段与动态对象字段？一般来说，我们希望在相关子类型具有`key`能力时使用动态对象字段，否则使用动态字段。有关根本原因的完整解释，请查看@sblackshear 的[此论坛帖子](https://forums.sui.io/t/dynamicfield-vs-dynamicobjectfield-why-do-we-have-both/2095) .

## 重温 `Table`

现在我们了解了动态字段的工作原理，我们可以将 Table 集合视为动态字段操作的简单的封装。

您可以查看 Sui 中 `Table` 类型的[源代码](https://github.com/MystenLabs/sui/blob/eb866def280bb050838d803f8f72e67e05bf1616/crates/sui-framework/sources/table.move) 作为练习，并查看之前介绍的每个操作如何映射到动态字段操作，以及如何使用一些额外的逻辑来跟踪`Table`的大小。
