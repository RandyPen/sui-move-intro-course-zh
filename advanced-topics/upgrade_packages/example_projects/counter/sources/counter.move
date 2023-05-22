module counter::counter {
    use sui::event;
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // 1. Bump the `VERSION` of the package.
    const VERSION: u64 = 2;

    struct Counter has key {
        id: UID,
        version: u64,
        admin: ID,
        value: u64,
    }

    struct AdminCap has key {
        id: UID,
    }

    struct Progress has copy, drop {
        reached: u64,
    }

    /// Not the right admin for this counter
    const ENotAdmin: u64 = 0;

    /// Migration is not an upgrade
    const ENotUpgrade: u64 = 1;

    /// Calling functions from the wrong package version
    const EWrongVersion: u64 = 2;

    fun init(ctx: &mut TxContext) {
        let admin = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(Counter {
            id: object::new(ctx),
            version: VERSION,
            admin: object::id(&admin),
            value: 0,
        });

        transfer::transfer(admin, tx_context::sender(ctx));
    }

    public entry fun increment(c: &mut Counter) {
        assert!(c.version == VERSION, EWrongVersion);
        c.value = c.value + 1;

        if (c.value % 100 == 0) {
            event::emit(Progress { reached: c.value })
        }
    }

    // 2. Introduce a migrate function
    entry fun migrate(c: &mut Counter, a: &AdminCap) {
        assert!(c.admin == object::id(a), ENotAdmin);
        assert!(c.version < VERSION, ENotUpgrade);
        c.version = VERSION;
    }
}