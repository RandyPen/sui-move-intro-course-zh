# 部署智能合约与 Hello World Demo 项目

## 完整的 Hello World 示例项目

完整的 Hello World 项目可以在[这里](https://github.com/sui-foundation/sui-move-intro-course/tree/main/unit-one/example_projects/hello_world)被找到。

## 部署智能合约

我们使用 Sui CLI 将 package 部署到 Sui 网络。你可以选择部署到 Sui 的 devnet 开发网，testnet 测试网或者本地节点。只要将 Sui CLI 设置到对应网络，并且拥有足够支付 gas 的 tokens 即可。

部署 package 的 Sui CLI 指令如下:

```bash
sui client publish --path <absolute local path to the Sui Move package> --gas-budget 3000000000
```

如果合约部署成功，输出信息会跟下面相似:

![发布输出](https://github.com/sui-foundation/sui-move-intro-course/blob/main/unit-one/images/publish.png)

在 `Created Objects` 下面的是刚才发布的 Hello World package 智能合约的 object ID. 

让我们使用 export 指令将该 object ID 的值传递给一个变量。

```bash
export PACKAGE_ID=<在先前输出信息中的 package object ID>
```

## 在交易中调用函数

接下来，我们通过调用刚才部署的智能合约中的 `mint` 函数来 mint 一个 Hello World object.

我们能够做这种操作是因为 `mint` 是一个 entry 函数。

完成该操作的 Sui CLI 指令是:

```bash
sui client call --function mint --module hello_world --package $PACKAGE_ID --gas-budget 300000000
```

如果 `mint` 函数被成功调用，一个 Hello World object 会被创建和转移，console 中输出的信息会与下面相似:

![Mint 输出](https://github.com/sui-foundation/sui-move-intro-course/blob/main/unit-one/images/mint.png)

在 `Created Objects` 下面的是  Hello World object 的 object ID. 

## 使用 Sui Explorer 察看 Object

可以使用 [Sui Explorer](https://explorer.sui.io/) 来察看我们刚才创建和转移的 Hello World object. 

从右上角的下拉菜单中选择正在使用的网络。

如果你使用的是本地开发节点，选择 `Custom RPC URL` 然后输入:

```
http://127.0.0.1:9000
```

根据先前交易输出信息中的 object ID 进行搜索，你会在 explorer 中看到 object 的详情:

![Explorer 输出](https://github.com/sui-foundation/sui-move-intro-course/blob/main/unit-one/images/explorer.png)

你应该能看到这个 object 的属性中包含 "Hello World!" 字符串。

做得很棒！本课程的第一单元到这里完结。