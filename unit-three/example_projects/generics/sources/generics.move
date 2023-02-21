// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Basic generics example for Sui Move
/// 
/// A part of the Sui Move intro course: 
/// 
module generics::generics {
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

    struct Box<T: store> has key, store {
        id: UID,
        value: T
    }

    struct SimpleBox has key, store {
        id: UID,
        value: u8
    }

    struct PhantomBox<phantom T: drop> has key {
        id: UID,
    }

    public entry fun create_box<T: store>(value: T,  ctx: &mut TxContext){
        transfer::transfer(Box<T> {id: object::new(ctx), value }, tx_context::sender(ctx))
    }

    public entry fun create_simple_box(value: u8,  ctx: &mut TxContext){
        transfer::transfer(SimpleBox {id: object::new(ctx), value }, tx_context::sender(ctx))
    }

    public entry fun create_phantom_box<T: drop >(_value: T,  ctx: &mut TxContext){
        transfer::transfer(PhantomBox<T> {id: object::new(ctx)}, tx_context::sender(ctx))
    }


    struct No_Store has drop {}

    fun init(ctx: &mut TxContext) {
        create_box<bool>(true, ctx);
        create_box<u128>(1u128, ctx);

        // Fail
        // create_box<No_Store>(No_Store {}, ctx);
        // create_phantom_box<No_Store>(Only_drop{}, ctx);
    }
}