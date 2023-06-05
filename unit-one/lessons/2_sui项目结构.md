# Sui 项目结构 

## Sui Module 与 Package

- 一个 Sui module 是一系列函数 functions 和类型 types 打包后的集合，被开发者发布到一个特定的地址下

- Sui 的标准库发布在 `0x2` 地址下，而用户发布 modules 的地址则是 Sui Move 虚拟机分配的伪随机地址

- Module 开头是 `module` 关键词，后面跟着 module 名和花括号 {} ，module 的内容放置在花括号内。

```Rust
module hello_world {

    // module 内容

}
```

- 已发布的 modules 在 Sui 里是 immutable objects; 意味着不能被更改、转移或删除。因为不可变的特性，该 object 不再由某个人拥有，因此可以被任何人使用。

- Move package 是一系列 modules 的集合，外加上 Move.toml 的配置文件

## 初始化一个 Sui Move Package

使用下面的 Sui CLI 指令来快速创建一个 Sui package 框架:

`sui move new <PACKAGE NAME>`

在我们这个单元的例子，会创建一个 Hello World 项目:

`sui move new hello_world`

这条指令创建了: 
- 项目根文件夹 `hello_world`
- `Move.toml` 配置文件
- 用于存放 Sui Move 智能合约的 `sources` 子文件夹

### `Move.toml` 配置结构

`Move.toml` 是一个package的配置文件，会被自动创建于项目的根目录。

`Move.toml` 包含三个部分:

- `[package]` 声明了该 package 的命名和版本数  
- `[dependencies]` 声明了该 package 依赖的其他 packages, 包括 Sui 标准库和其他第三方依赖库
- `[addresses]` 声明了该 packages 源代码中地址的别名

#### 示例 `Move.toml` 文件

这是使用 Sui CLI 命令生成 `hello_world` package 时自动生成的配置文件 `Move.toml`:

```bash
[package]
name = "hello_world"
version = "0.0.1"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "main" }

[addresses]
hello_world = "0x0"
sui = "0x2"
```

我们可以看到，在这里 Sui 标准库使用了一个 Github 仓库来声明，但其实也可以使用本地 binary 文件的相对路径或绝对路径来声明，比如:

```
[dependencies]
Sui = { local = "../sui/crates/sui-framework/packages/sui-framework" } 
```

### Sui Module 和 Package 的命名

- Sui Move 的 module 和 package 命名跟随[Rust命名规范](https://rust-lang.github.io/api-guidelines/naming.html)

- Sui Move module 和 package 命名通常使用蛇形命名法 snake casing, i.e. this_is_snake_casing.

- Sui module 名称会使用 Rust 路径分隔符 `::` 来分开 package 名和 module 名, 比如:
    1. `unit_one::hello_world` - `hello_world` module in `unit_one` package
    2. `capy::capy` - `capy` module in `capy` package
