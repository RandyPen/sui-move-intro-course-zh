# Object Wrapping

在 Sui Move 中有许多种方法可以将一个 object 嵌套在另一个 object 内。我们接下来介绍的第一种方法是 object wrapping.  

继续看我们成绩记录单的例子。我们定义一个新的 `WrappableTranscript` 类型，以及关联的封装类型 `Folder`. 

```rust
public struct WrappableTranscript has store {
    history: u8,
    math: u8,
    literature: u8,
}

public struct Folder has key {
    id: UID,
    transcript: WrappableTranscript,
}
```

在上面的例子中，`Folder` 封装了 `WrappableTranscript`, 并且 `Folder` 是可以根据其 id 查询地址等信息的，因为其具有 `key` 的能力。

## Object Wrapping 特性

如果一个 struct 类型能被嵌入到一个 Sui object struct 中，这个 Sui object struct 通常具有 `key` 能力，被嵌入的 struct 必须具有 `store` 能力。  

当一个 object 被封装后，封装起来的 object 就不再能单独根据 object ID 来获取。它会变成 封装 object 的一部分。更重要的是，被封装的 object 不能被作为参数进行传递，而只能通过 封装 object 进行获取。

由于这个特性，object wrapping 可以被用作为限制一个 object 在特定的合约调用之外不能被获取的方法。对更多关于 Object wrapping 的信息，可以看[这里](https://docs.sui.io/devnet/build/programming-with-objects/ch4-object-wrapping)。
