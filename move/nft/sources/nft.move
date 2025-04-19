module nft::nft {

    use std::string::String;
 
    public struct NFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        owner: address,
        created_time: u64,
    }
 
    public fun create_nft(
        name: String,
        description: String,
        image_url: String,
        ctx: &mut TxContext 
    ): NFT {
        NFT {
            id: object::new(ctx),
            name,
            description,
            image_url,
            owner: tx_context::sender(ctx),
            created_time: 0, // 实际应该用 sui::clock 获取时间 
        }
    }
 
    public fun transfer_nft(
        nft: NFT,
        recipient: address,
        _ctx: &mut TxContext 
    ) {
        transfer::public_transfer(nft, recipient)
    }
}