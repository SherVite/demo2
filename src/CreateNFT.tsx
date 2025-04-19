import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Flex, Text, TextField, Checkbox } from "@radix-ui/themes";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable, } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { useState } from "react";
// import { SuiObjectData } from "@mysten/sui/client";  //注意确认
// interface CreateNFTProps {
//   onCreated: (id:string) => void;
// } 

export function CreateNFT({
  onCreated,
}:{
  onCreated:(id:string) => void; 
}) {
  const nftPackageId = useNetworkVariable("nftPackageId");
  const suiClient = useSuiClient();
  const { 
    mutate: signAndExecute, 
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    recipient: "",
    mint: true,
    transfer: false,
  });

  const handleSubmit = () => {
    const tx = new Transaction();

    //铸造NFT
    
    tx.moveCall({ 
      target: `${nftPackageId}::nft::create_nft`,
      arguments: [
        tx.pure(formData.name, "string"),
        tx.pure(formData.description, "string"), 
        tx.pure(formData.imageUrl, "string"),
         
      ],
      
    });
    
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async ({ digest }) => {
          // 等待交易完成并获取创建的NFT ID
          const { effects } = await suiClient.waitForTransaction({
            digest,
            options: { showEffects: true },
          });
          const newNftId = effects?.created?.[0]?.reference?.objectId!;
          
          // 调用回调传递NFT ID
          onCreated(newNftId);

    // 如果需要转移 
    if (formData.transfer  && formData.recipient && newNftId)  {
      const transferTx = new Transaction();
      transferTx.transferObjects(
        [transferTx.object(newNftId)], // 使用刚创建的NFT ID
        transferTx.pure(formData.recipient, "string")
      );
      await signAndExecute({ transaction: transferTx });
    }
  },
}
);
};

 
  return (
    <Container size="2" p="4">
      <Flex direction="column" gap="4">
        <TextField.Root>
          <TextField.Input 
            placeholder="NFT 名称"
            value={formData.name} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})} 
          />
        </TextField.Root>
 
        <TextField.Root>
          <TextField.Textarea 
            placeholder="描述"
            value={formData.description} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, description: e.target.value})} 
          />
        </TextField.Root>
 
        <TextField.Root>
          <TextField.Input 
            placeholder="图片URL"
            type="url"
            value={formData.imageUrl} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, imageUrl: e.target.value})} 
          />
        </TextField.Root>
 
        <Flex gap="3">
          <label className="flex items-center gap-2">
            <Checkbox 
              checked={formData.mint} 
              onCheckedChange={(checked) => 
                setFormData({...formData, mint: !!checked})
              }
            />
            <Text size="2">立即铸造</Text>
          </label>
 
          <label className="flex items-center gap-2">
            <Checkbox 
              checked={formData.transfer} 
              onCheckedChange={(checked) => 
                setFormData({...formData, transfer: !!checked})
              }
            />
            <Text size="2">直接转移</Text>
          </label>
        </Flex>
 
        {formData.transfer  && (
          <TextField.Root>
            <TextField.Input 
              placeholder="接收地址"
              value={formData.recipient} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, recipient: e.target.value})} 
            />
          </TextField.Root>
        )}
 

        {isSuccess && (
           <Text color="green" mt="2" size="2">
             NFT 创建成功！
           </Text>
        )}

        <Button 
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? <ClipLoader size={16} color="currentColor" /> : "提交"}
        </Button>
      </Flex>
    </Container>
  );
}    
//     signAndExecute({Transaction: tx});
    
//     if (formData.mint) {
//       tx.moveCall({
//         target: `${nftPackageId}::nft::create_nft`,
//         arguments: [
//           tx.pure(formData.name),
//           tx.pure(formData.description),
//           tx.pure(formData.imageUrl),
//           tx.pure(tx.sender),    //自动填充当前发送者地址作为ctx
//         ],
//       });
//     }

//     if (formData.transfer && formData.recipient) {
//       // 这里需要先获取NFT ID，实际场景需要根据业务逻辑调整
//       // 示例：假设mint后立即transfer（实际需先获取objectId�?
//       tx.moveCall({
//         target: `${nftPackageId}::nft::transfer_nft`,
//         arguments: [
//           tx.object(nftId), // 需替换为实际NFT的objectId
//           tx.pure(formData.recipient),
//         ],
//       });
//     }

//     signAndExecute({ transaction: tx });
//   };

//   return (
//     <Container>
//       <Form>
//         <Input
//           label="NFT名称"
//           value={formData.name}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
//         />
//         <Textarea
//           label="描述"
//           value={formData.description}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
//         />
//         <Input
//           label="图片URL"
//           value={formData.imageUrl}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, imageUrl: e.target.value })}
//         />
//         <Checkbox
//           checked={formData.mint}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, mint: e.checked })}
//         >铸造NFT</Checkbox>
//         <Checkbox
//           checked={formData.transfer}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, transfer: e.checked })}
//         >转账给地址</Checkbox>
//         {formData.transfer && (
//           <Input
//             label="目标地址"
//             value={formData.recipient}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, recipient: e.target.value })}
//           />
//         )}
//         <Button
//           onClick={handleSubmit}
//           disabled={isPending}
//         >
//           {isPending ? <ClipLoader size={20} /> : "创建/转账NFT"}
//         </Button>
//       </Form>
//     </Container>
//   );
// }
