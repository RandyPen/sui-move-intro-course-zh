# 参数传递与删除 Object

## 参数传递 (使用 `value`, `ref` 和 `mut ref`)

如果你已经熟悉 Rust 语言，你应该也会熟悉 Rust 的所有权概念。有几个拓展视频: [所有权规则、内存与分配](https://www.bilibili.com/video/BV1hp4y1k7SV?p=16), [所有权与函数](https://www.bilibili.com/video/BV1hp4y1k7SV?p=17), [引用与借用](https://www.bilibili.com/video/BV1hp4y1k7SV?p=18)。  
与 Solidity 对比起来，move 语言的一个优点在于，你根据函数的接口就可以判断出这个函数调用会对你的资产做什么操作。看几个例子:

```rust
use sui::object::{Self};

// 你被许可获取分数但不能修改它
public fun view_score(transcriptObject: &TranscriptObject): u8{
    transcriptObject.literature
}

// 你被允许查看和编辑分数，但不能删除它
public entry fun update_score(transcriptObject: &mut TranscriptObject, score: u8){
    transcriptObject.literature = score
}

// 你被允许对分数做任何的操作，包括查看、编辑、删除整个 transcript 
public entry fun delete_transcript(transcriptObject: TranscriptObject){
    let TranscriptObject {id, history: _, math: _, literature: _ } = transcriptObject;
    object::delete(id);
}
```

## 删除 Object 与 解包 Struct

上面 `delete_transcript` 方法的例子展现了如何在 Sui 上删除一个 object.

1. 要删除一个 object, 你首先要解包这个 object 并且获取它的 object ID. 解包的操作只能够在定义了这个 object 的 module 内进行。这是为了遵守 Move 的专用结构操作规则:
   
- struct 类型只能在定义了该 struct 的 module 内创建("打包") 或 销毁("解包")
- struct 的属性也只能在定义了该 struct 的 module 内获取

根据这些规则，如果你想要在定义了该 struct 的 module 之外调整你的 struct, 就需要为这些操作提供 public methods.

2. 在解包 struct 获取它的 ID 之后，可以通过调用 framework 里头的 `object::delete` 方法处理它的 object ID 来实现删除。

*💡注意: 在上面示例中使用了下划线 `_` 来标注未使用的变量或参数，可以在传入后立即消耗掉它们。*  

**这里能找到对应这里的处于开发进展中版本的代码: [WIP transcript.move](../example_projects/transcript/sources/transcript_1.move_wip)**



