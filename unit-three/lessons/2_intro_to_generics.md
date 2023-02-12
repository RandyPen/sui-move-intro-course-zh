# Generics 范型

Generics在计算机术语中被称为范型，引用 [Rust Book](https://doc.rust-lang.org/stable/book/ch10-00-generics.html) 对于泛型得定义：*泛型是具体类型或其他属性的抽象替代品*。范型使得在编写 Sui Move 代码时提供更强的灵活性，并避免逻辑重复。

实际上，泛型允许我们只编写单个函数，写一套逻辑，而应用于任何类型上。所以这种函数也被称为模板 ——个可以应用于任何类型的模板处理程序。

范型是 Sui Move 中的一个关键概念，理解并对其工作原理保持直觉非常重要，因此请花点时间阅读本节并充分理解每个部分。

## **范型用法**

### 在架构中使用范型

看一个基本示例，了解如何使用 Generics 创建一个可以容纳 Sui Move 中任何类型的容器 `Box` 。

首先，在没有范型的情况下，我们可以定义一个包含  `u64` 类型的 `Box`，如下所示：

```rust
module Storage {
    struct Box {
        value: u64
    }
}
```

但是，这种类型只能保存 u64 类型的值，为了能够存储其他类型显然我们不能把所有类型的box都枚举完，所以这个时候就需要使用泛型。 代码将修改如下：

```rust
module Storage {
    struct Box<T> {
        value: T
    }
}
```

#### 能力限制

我们可以添加条件去强制传递给泛型的类型必须具有某些能力。 语法如下所示：

```rust
module Storage {
    // T must be copyable and droppable 
    struct Box<T: store + drop> has key, store {
        value: T
    }
}
```

💡这里需要注意的是，由于外部容器类型，上例中的内部类型 T 必须满足一定的能力约束。 在这个例子中，`T` 必须有 `store`，因为 `Box` 有 `store` 和 `key`。 但是，`T` 也可以具有容器没有的能力，如本例中的 `drop`。

直觉是，如果允许容器包含一个不遵循它所遵循的相同规则的类型，容器将违反其自身的能力。 如果盒子里的东西不能被储存，那盒子怎么能被储存呢？

我们将在下一节中看到，在某些情况下，可以使用一种称为`phantom` 的特殊关键字来绕过此规则。

*💡有关泛型类型的一些示例，请参阅 `example_projects`下的* [泛型项目](https://github.com/sui-foundation/sui-move-intro-course/blob/main/unit-three/example_projects/generics)*。*

### 在函数中使用Generics

要编写一个返回 Box 实例的函数，该实例可以为 value 字段接受任何类型的参数，我们还必须在函数定义中使用泛型。 该函数可以定义如下：

```rust
public fun create_box<T>(value: T): Box<T> {
        Box<T> { value }
    }
```

如果我们想限制函数只接受特定类型的 value，我们只需在函数签名中指定该类型，如下所示：

```rust
public fun create_box(value: u64): Box<u64> {
        Box<u64>{ value }
    }
```

这只接受 u64 类型的输入，为了使用 `create_box` 的方法，同时仍然使用同样的泛型 Box 结构。

#### 使用Generics调用函数

要调用带有包含泛型的签名的函数，我们必须在方括号中指定类型，如以下语法所示：

```rust
// value will be of type Storage::Box<bool>
    let bool_box = Storage::create_box<bool>(true);
// value will be of the type Storage::Box<u64>
    let u64_box = Storage::create_box<u64>(1000000);
```

#### 使用运用Sui CLI的Generics调用函数

要从 Sui CLI 调用其签名中带有泛型的函数，您必须使用标志 `--type-args` 定义参数的类型。

以下示例调用 `create_box` 函数创建一个盒子，其中包含 `0x2::sui::SUI` 类型的硬币：

```bash
sui client call --package $PACKAGE --module $MODULE --function "create_box" --args $OBJECT_ID --type-args "0x2::coin::Coin<0x2::sui::SUI>" --gas-budget 10000
```

## 高级 Generics 语法

有关 Sui Move 中涉及使用的更多的泛型高级语法，例如多个泛型类型，请参阅 [Move Book 中关于 Generic 的部分。](https://move-book.com/advanced-topics/understanding-generics.html)

但是对于我们当前关于同质化代币的课程，您已经足够了解泛型是如何运行的。