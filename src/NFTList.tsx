import { useSuiClientQuery,useCurrentAccount } from "@mysten/dapp-kit";
import { Flex, Box, Text, Button } from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig"; // 添加导入
import type { SuiObjectData,/* SuiObjectResponseQuery */ } from "@mysten/sui/client"; // 关键导入

export function NFTList() {
  const currentAccount = useCurrentAccount();
  
  const nftPackageId = useNetworkVariable("nftPackageId"); // 从网络配置获取（类型安全）

  // 1. 修改过滤器为你的NFT类型 
  // const { data: ownedObjects } = useSuiClientQuery(
    const { data: ownedObjects } = useSuiClientQuery<SuiObjectData[]>(
    "getOwnedObjects", {
    owner: currentAccount?.address || "",
    options: { 
      filter: { 
        Type: `${nftPackageId}::nft::NFT` // 替换为你的packageId 
      },
      showContent: true, // 确保返回字段数据 
      showType: true
    },
  });

  if (!ownedObjects?.length) {
    return (
      <Box py="5" style={{ textAlign: 'center' }}>
        <Text color="gray">没有找到任何 NFT</Text>
      </Box>
    );
  } 

  return (
    <Flex wrap="wrap" gap="4" p="4">
      {ownedObjects.map((obj)  => {
        const nft = obj.data  as SuiObjectData;
        const fields = nft.content?.dataType  === "moveObject" 
          ? (nft.content.fields  as Record<string, string>)
          : null;
 
        return (
          <Flex 
            key={nft.objectId} 
            direction="column" 
            gap="3" 
            width="240px" 
            style={{ 
              border: '1px solid var(--gray-a6)',
              borderRadius: 'var(--radius-3)',
              padding: 'var(--space-3)'
            }}
          >
            //图片处理
            <Box style={{ aspectRatio: '1/1', overflow: 'hidden' }}> 
              <img 
                src={fields?.image_url || '/placeholder-nft.png'} 
                alt={fields?.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
            //信息简化
            <Text weight="bold">{fields?.name || '未命名 NFT'}</Text>
            <Text size="2" color="gray">
              {fields?.description?.slice(0, 30)}{fields?.description?.length > 30 ? '...' : ''}
            </Text>
            
            <Button size="1" asChild variant="soft">
              <a 
                href={`https://suiexplorer.com/object/${nft.objectId}?network=devnet`} 
                target="_blank"
                rel="noopener noreferrer"
              >
                在浏览器查看 
              </a>
            </Button>
          </Flex>
        );
      })}
    </Flex>
  );
}