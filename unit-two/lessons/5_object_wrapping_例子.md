# Object Wrapping 例子

我们来对成绩记录单的例子实现 object wrapping, 让 `WrappableTranscript` 被 `Folder` object 封装起来，使得 `Folder` object 可以被解包，因而内部的成绩记录单只能被特定的地址/观察者获取。

## 修改 `WrappableTranscript` 和 `Folder`

首先，需要对我们上一节中定制的类型 `WrappableTranscript` 和 `Folder` 做一些调整。

1. 给 `WrappableTranscript` 类型定义加上 `key` 的能力，可以成为资产和被转移。

回想一下，在 Sui Move 中具备了 `key` 和 `store` 能力的定制类型可以认为是资产。

```rust
struct WrappableTranscript has key, store {
        id: UID,
        history: u8,
        math: u8,
        literature: u8,
}
```

2. 我们需要为 `Folder` struct 增加一个额外的属性 `intended_address` 用来声明内部被封装起来的成绩记录单的目标观察者的地址。 

``` rust
struct Folder has key {
    id: UID,
    transcript: WrappableTranscript,
    intended_address: address
}
```

## 请求 Transcript 方法

```rust
public entry fun request_transcript(transcript: WrappableTranscript, intended_address: address, ctx: &mut TxContext){
    let folderObject = Folder {
        id: object::new(ctx),
        transcript,
        intended_address
    };
    //We transfer the wrapped transcript object directly to the intended address
    transfer::transfer(folderObject, intended_address)
}
```

这个方法简易地把一个 `WrappableTranscript` object 封装到一个 `Folder` object 里头，然后将被封装的成绩记录单转移到目标地址。

## 解封装 Transcript 方法

```rust
public entry fun unpack_wrapped_transcript(folder: Folder, ctx: &mut TxContext){
    // Check that the person unpacking the transcript is the intended viewer
    assert!(folder.intended_address == tx_context::sender(ctx), 0);
    let Folder {
        id,
        transcript,
        intended_address:_,
    } = folder;
    transfer::transfer(transcript, tx_context::sender(ctx));
    // Deletes the wrapper Folder object
    object::delete(id)
    }
```

如果这个方法的调用者就是成绩记录单的目标观察者，就会从 `Folder` wrapper object 中解封装出 `WrappableTranscript` object, 然后将其发送给方法的调用者。

*问题: 我们为什么需要在这里手动删除 wrapper object? 如果我们不删除会怎样?*

### Assert

我们使用 `assert!` 语法来判定在交易中解包出成绩记录单的地址与 `Folder` wrapper object 中的 `intended_address` 属性是一致的。

这个 `assert!` 宏会以下面的格式输入两个参数:

```
assert!(<bool expression>, <code>)
```

这里的布尔表达式必须判断为真，否则就会弹出错误码 `<code>` 并中止。

### 定义错误码

上面是用了默认的0来作为错误码，但其实我们也可以用下面的方式来定义其他错误码:

```rust
    const ENotIntendedAddress: u64 = 1;
```

这个错误码会在应用层上被消耗掉并进行合适的处理。

**这里能找到对应这里的第二版处于开发进展中版本的代码: [WIP transcript.move](../example_projects/transcript/sources/transcript_2.move_wip)**

