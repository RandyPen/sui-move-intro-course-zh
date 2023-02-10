# The Witness Design Pattern

接下来，我们需要了解witness设计模式，来明确同质化代币在Sui Move中是如何实现的。

witness是一种设计模式，用于证明有关的一个资源或类型`A`，在短暂的`witness`资源被消耗后只能启动一次。

`witness`资源在使用后必须立即被消耗或丢弃，确保它不能被重复使用以创建`A`的多个实例。

## Witness Pattern Example

在下面的例子中，`witness`资源是`PEACE`，而我们要控制实例化的`A`类型是`Guardian`。

`witness`资源类型必须有`drop`关键字，这样这个资源在被传入一个函数后可以被丢弃。我们看到`PEACE`资源的实例被传递到`create_guardian`方法中并被丢弃（注意`witness`前的下划线），确保只能创建一个`Guardian`的实例。

```rust
    /// Module that defines a generic type `Guardian<T>` which can only be
    /// instantiated with a witness.
    module witness::peace {
        use sui::object::{Self, UID};
        use sui::transfer;
        use sui::tx_context::{Self, TxContext};

        /// Phantom parameter T can only be initialized in the `create_guardian`
        /// function. But the types passed here must have `drop`.
        struct Guardian<phantom T: drop> has key, store {
            id: UID
        }

        /// This type is the witness resource and is intended to be used only once.
        struct PEACE has drop {}

        /// The first argument of this function is an actual instance of the
        /// type T with `drop` ability. It is dropped as soon as received.
        public fun create_guardian<T: drop>(
            _witness: T, ctx: &mut TxContext
        ): Guardian<T> {
            Guardian { id: object::new(ctx) }
        }

        /// Module initializer is the best way to ensure that the
        /// code is called only once. With `Witness` pattern it is
        /// often the best practice.
        fun init(witness: PEACE, ctx: &mut TxContext) {
            transfer::transfer(
                create_guardian(witness, ctx),
                tx_context::sender(ctx)
            )
        }
    }
```

*上面的例子是从*[Damir Shamanaev](https://github.com/damirka)*的优秀书籍*[Sui Move by Example](https://examples.sui.io/patterns/witness.html)*中修改的。*

## phantom关键字

在上面的例子中，我们希望 `Guardian` 类型具有 `key` 和 `store` 的能力，这样它就是一个资产，可以转移并在全局存储中持续存在。

我们还想把 `witness` 资源 `PEACE` 传入 `Guardian`，但 `PEACE` 只有 `drop` 的能力。回顾我们之前关于[能力约束](https://github.com/sui-foundation/sui-move-intro-course/blob/main/unit-three/lessons/2_intro_to_generics.md#ability-constraints)和内部类型的讨论，该规则暗示`PEACE`也应该有`key`和`storage`，因为外部类型`Guardian`有。但是在这种情况下，我们不想给我们的`witness`类型添加不必要的能力，因为这样做可能会导致不符合预期的行为和漏洞。

我们可以使用关键字`phantom`来解决这种情况。当一个类型参数没有在结构定义中使用，或者它只是作为另一个`phantom`类型参数的参数使用时，我们可以使用`phantom`关键字来要求Move类型系统放松对内部类型的能力约束规则。我们看到`Guardian`在它的任何字段中都没有使用`T`类型，所以我们可以安全地声明`T`是一个`phantom`类型。

关于`phantom`关键字的更深入解释，请查看Move语言文档的[相关章节](https://github.com/move-language/move/blob/main/language/documentation/book/src/generics.md#phantom-type-parameters)。

## One Time Witness

一次性见证One Time Witness（OTW）是Witness模式的一个子模式，我们利用模块`init`函数来确保只创建一个`witness`资源的实例（所以`A`类型被保证是唯一的）。

在Sui Move中，如果一个类型的定义具有以下属性，那么它就被认为是一个OTW。

-   该类型是以模块的名字命名的，但大写字母。
-   该类型只具有`drop`的能力

为了得到这个类型的实例，你需要把它作为第一个参数添加到模块的`init`函数中，如上例。然后Sui运行时将在模块发布时自动生成OTW结构。

上面的例子使用一次性见证设计模式来保证`Guardian`是一个单例。