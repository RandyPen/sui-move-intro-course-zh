# 使用 Sui Objects

## 介绍

Sui Move 是一门完全以 object 为中心的编程语言。在Sui上交易的输入与输出都可以是对 objects 的操作。 我们之前就已经在[第一单元的第四课中](../../unit-one/lessons/4_定制类型与能力.md#定制类型与能力)简单接触过这个概念，Sui objects 是 Sui 存储中的基本单元，所有都会使用 `struct` 关键词开头。  

看一个记录学生成绩报告单的例子:

```rust
struct Transcript {
    history: u8,
    math: u8,
    literature: u8,
}
```

上面定义的只是一个常规的 Move struct, 但还不是一个 Sui object. 要使一个定制的 Move 类型实例成为全局存储的 Sui object, 我们还需要添加 `key` 能力以及在 struct 定义时内部添加全局唯一的 `id: UID` 属性。

```rust
use sui::object::{UID};

struct TranscriptObject has key {
    id: UID,
    history: u8,
    math: u8,
    literature: u8,
}
```

## 创建一个 Sui Object

创建一个 Sui object 需要一个唯一ID, 我们可以根据当前 `TxContext` 中的信息，使用 `sui::object::new` 函数来创建一个新的 ID. 

在 Sui 当中，每个 object 都必须拥有一个所有者，这个所有者可以是地址，别的 object, 或者就被所有人共享。在我们的例子中，我们想让新建的 `transcriptObject` 属于交易发起者。这可以先使用 `tx_context::sender` 函数获得当前 entry 函数调用者也就是交易发起者 sender 的地址，然后用 Sui framework 中的 `transfer` 函数转移所有权。

在下一节，我们会更深入探讨 object 的所有权。

```rust
use sui::object::{Self};
use sui::tx_context::{Self, TxContext};
use sui::transfer;

public entry fun create_transcript_object(history: u8, math: u8, literature: u8, ctx: &mut TxContext) {
  let transcriptObject = TranscriptObject {
    id: object::new(ctx),
    history,
    math,
    literature,
  };
  transfer::transfer(transcriptObject, tx_context::sender(ctx))
}
```

*💡注意: Move 支持属性的punning简化，当属性名与绑定的变量名一致的时候，就可以省略属性值的传递。*