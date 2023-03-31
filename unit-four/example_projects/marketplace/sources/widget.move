/// Copyright (c) Sui Foundation, Inc.
/// SPDX-License-Identifier: Apache-2.0
///
/// Modified from https://github.com/MystenLabs/sui/blob/main/sui_programmability/examples/nfts/sources/marketplace.move

module marketplace::widget {

    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct Widget has key, store {
        id: UID,
    }

    public entry fun mint(ctx: &mut TxContext) {
        let object = Widget {
            id: object::new(ctx)
        };
        transfer::public_transfer(object, tx_context::sender(ctx));
    }

}