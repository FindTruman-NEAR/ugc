import { NearBindgen, near, call, view, UnorderedMap, includeBytes, NearPromise, bytes, } from 'near-sdk-js';
import { AccountId } from 'near-sdk-js/lib/types';
import { story, updateStoryPara, publishStoryNftPara, storyNftInfo, claimAuthorReservedNftPara } from './model';

@NearBindgen({})
class StoryFactory {
  nextStoryId: number = 1;
  storiesMap: UnorderedMap<story> = new UnorderedMap<story>('story');
  storyNftMap: UnorderedMap<storyNftInfo> = new UnorderedMap<storyNftInfo>('storyNft');
  storyNftContractMap: UnorderedMap<string> = new UnorderedMap<string>('storyNftContract');

  @view({})
  get_nextStoryId(): number {
    return this.nextStoryId;
  }

  @view({})
  get_storiesMap(): UnorderedMap<story> {
    return this.storiesMap;
  }

  @view({})
  getStoryIdInfo({ storyId }: { storyId: number }): story {
    return this.storiesMap.get(storyId.toString());
  }

  @view({})
  getStoryIdNftSale({ storyId }: { storyId: number }): storyNftInfo {
    return this.storyNftMap.get(storyId.toString());
  }

  @view({})
  getNftAddress({ storyId }: { storyId: number }): string {
    return this.storyNftContractMap.get(storyId.toString());
  }

  @view({})
  restOfStoryNftOnChain({ storyId }: { storyId: number }): string {
    if (this.storyNftContractMap.get(storyId.toString()) != null) {
      const nftSaleInfo = this.storyNftMap.get(storyId.toString())
      return (nftSaleInfo.total - nftSaleInfo.sold - nftSaleInfo.authorReserve).toString();
    } else {
      return "NFT does not exist!";
    }
  }

  @view({})
  authorReservedNftRest({ storyId }: { storyId: number }): string {
    if (this.storyNftContractMap.get(storyId.toString()) != null) {
      const nftSaleInfo = this.storyNftMap.get(storyId.toString())
      return (nftSaleInfo.authorReserve - nftSaleInfo.authorClaimed).toString();
    } else {
      return "NFT does not exist!";
    }
  }

  @view({})
  get_price({ storyId }: { storyId: number }): string {
    if (this.storyNftContractMap.get(storyId.toString()) != null) {
      const nftSaleInfo = this.storyNftMap.get(storyId.toString())
      return (nftSaleInfo.price).toString();
    } else {
      return "NFT does not exist!";
    }
  }

  @call({})
  publishStory({ cid }: { cid: string }): UnorderedMap<story> {
    const pubStory: story = {
      author: near.signerAccountId(),
      cid: cid
    };
    this.storiesMap.set(this.nextStoryId.toString(), pubStory);
    this.nextStoryId = this.nextStoryId + 1;
    // events
    let publishStoryLog = {
      standard: "nep171",
      version: "nft-1.0.0",
      event: "publish_story",
      data: [
        {
          nestStoryId: this.nextStoryId,
          thisStoryInfo: pubStory
        }
      ]
    }
    near.log(`EVENT_JSON:${JSON.stringify(publishStoryLog)}`);
    return this.storiesMap;
  }

  @call({})
  updateStory(updateStoryPara: updateStoryPara): any {
    if (this.storiesMap.get(updateStoryPara.storyId.toString()) != null) {
      if (this.storiesMap.get(updateStoryPara.storyId.toString()).author == near.signerAccountId()) {
        this.storiesMap.set(updateStoryPara.storyId.toString(), { author: near.signerAccountId(), cid: updateStoryPara.cid });
        // events
        let updateStoryLog = {
          standard: "nep171",
          version: "nft-1.0.0",
          event: "update_story",
          data: [
            {
              storyId: updateStoryPara.storyId,
              newCid: updateStoryPara.cid
            }
          ]
        }
        near.log(`EVENT_JSON:${JSON.stringify(updateStoryLog)}`);
        return this.storiesMap.get(updateStoryPara.storyId.toString());
      } else {
        return "Not the author!";
      }
    } else {
      return "Story does not exist!";
    }
  }

  @call({})
  testm({ cid }: { cid: string }): any {
    return "0";
  }

  @call({ privateFunction: true })
  testn({ }): boolean {
    return false;
  }

  @call({ payableFunction: true })
  publishStoryNft(publishStoryNftPara: publishStoryNftPara): any {
    if (this.storiesMap.get(publishStoryNftPara.storyId.toString()) != null) {
      if (this.storiesMap.get(publishStoryNftPara.storyId.toString()).author == near.signerAccountId()) {
        let promise = NearPromise.new(publishStoryNftPara.storyId.toString() + "nftsale." + near.currentAccountId())
        promise
          .createAccount()
          .transfer(near.attachedDeposit())
          .deployContract(includeBytes("/non_fungible_token.wasm"))
          .functionCall("new_default_meta", bytes(JSON.stringify({ owner_id: near.currentAccountId() })), BigInt(0), BigInt("50000000000000"))
        const pubStoryNft: storyNftInfo = {
          storyId: publishStoryNftPara.storyId,
          name: publishStoryNftPara.name,
          image: publishStoryNftPara.image,
          description: publishStoryNftPara.description,
          uriPrefix: publishStoryNftPara.uriPrefix,
          token: publishStoryNftPara.token,
          price: publishStoryNftPara.price,
          total: publishStoryNftPara.total,
          authorReserve: publishStoryNftPara.authorReserve,
          sold: 0,
          authorClaimed: 0
        };
        return promise.then(
          NearPromise.new(near.currentAccountId())
            .functionCall("publishStoryNft_callback", bytes(JSON.stringify({ storyNftInfo: pubStoryNft, storyNftContractAdd: publishStoryNftPara.storyId.toString() + "nftsale." + near.currentAccountId() })), BigInt(0), BigInt("50000000000000"))
        );
      } else {
        return "Not the author!";
      }
    } else {
      return "Story does not exist!";
    }
  }

  @call({ privateFunction: true })
  publishStoryNft_callback({ storyNftInfo, storyNftContractAdd }: { storyNftInfo: storyNftInfo, storyNftContractAdd: string }): boolean {
    let result: string, success: boolean;
    try { result = near.promiseResult(0); success = true }
    catch { result = undefined; success = false }

    if (success) {
      this.storyNftContractMap.set(storyNftInfo.storyId.toString(), storyNftContractAdd)
      this.storyNftMap.set(storyNftInfo.storyId.toString(), storyNftInfo)
      // events
      let publishStoryNftLog = {
        standard: "nep171",
        version: "nft-1.0.0",
        event: "publish_storyNft",
        data: [
          {
            storyId: storyNftInfo.storyId,
            nftContract: storyNftContractAdd
          }
        ]
      }
      near.log(`EVENT_JSON:${JSON.stringify(publishStoryNftLog)}`);
      return true
    } else {
      near.log("Promise failed...")
      return false
    }
  }

  @call({ payableFunction: true })
  ft_on_transfer({ sender_id, amount, msg }: { sender_id: AccountId, amount: number, msg: string }): any {
    if (sender_id == near.signerAccountId()) {
      if (this.storyNftContractMap.get(msg) != null) {
        const storyInfo = this.storiesMap.get(msg)
        const nftContractAddress = this.storyNftContractMap.get(msg)
        const nftSaleInfo = this.storyNftMap.get(msg)
        if (nftSaleInfo.price <= amount) {
          if (nftSaleInfo.sold <= (nftSaleInfo.total - nftSaleInfo.authorReserve)) {
            const pubStoryNft: storyNftInfo = {
              storyId: nftSaleInfo.storyId,
              name: nftSaleInfo.name,
              image: nftSaleInfo.image,
              description: nftSaleInfo.description,
              uriPrefix: nftSaleInfo.uriPrefix,
              token: nftSaleInfo.token,
              price: nftSaleInfo.price,
              total: nftSaleInfo.total,
              authorReserve: nftSaleInfo.authorReserve,
              sold: nftSaleInfo.sold + 1,
              authorClaimed: nftSaleInfo.authorClaimed
            };
            let promise = NearPromise.new(nftSaleInfo.token)
              .functionCall("ft_transfer", bytes(JSON.stringify({ receiver_id: storyInfo.author, amount: nftSaleInfo.price })), BigInt("1"), BigInt("50000000000000"))
              .and(NearPromise.new(nftContractAddress)
              .functionCall("nft_mint", bytes(JSON.stringify({ token_id: (nftSaleInfo.sold + 1).toString(), receiver_id: near.signerAccountId(), token_metadata: { title: nftSaleInfo.name, description: nftSaleInfo.description, reference: nftSaleInfo.uriPrefix + "/" + (nftSaleInfo.sold + 1).toString() + ".json" } })), BigInt("80000000000000000000000"), BigInt("30000000000000"))
            )
            return promise.then(NearPromise.new(near.currentAccountId()))
            .functionCall("ft_on_transfer_callback", bytes(JSON.stringify({ storyNftInfo: pubStoryNft, amount: amount, price: nftSaleInfo.price })), BigInt(0), BigInt("50000000000000"))
          } else {
            return amount.toString();
          }
        } else {
          return amount.toString();
        }
      } else {
        return amount.toString();
      }
    } else {
      return amount.toString();
    }
  }

  @call({ privateFunction: true })
  ft_on_transfer_callback({ storyNftInfo, amount, price }: { storyNftInfo: storyNftInfo, amount: number, price: number }): any {
    let result: string, result1: string, success: boolean;
    // near.log(near.promiseResult(0))
    near.log("==============")
    // near.log(near.promiseResult(1))
    near.log("==============")
    try {
      result = near.promiseResult(0);
      success = true
    } catch {
      result = undefined;
      success = false
    }
    if (success) {
      this.storyNftMap.set(storyNftInfo.storyId.toString(), storyNftInfo)
      // events
      let nftMintLog = {
        standard: "nep171",
        version: "nft-1.0.0",
        event: "mint_nft",
        data: [
          {
            amount: amount,
            price: price
          }
        ]
      }
      near.log(`EVENT_JSON:${JSON.stringify(nftMintLog)}`);
      return (amount - price).toString();
    } else {
      near.log("Promise failed...")
      return amount.toString();
    }
  }

  @call({ payableFunction: true })
  claimAuthorReservedNft(claimAuthorReservedNftPara: claimAuthorReservedNftPara): any {
    if (this.storyNftContractMap.get(claimAuthorReservedNftPara.storyId.toString()) != null) {
      if (this.storiesMap.get(claimAuthorReservedNftPara.storyId.toString()).author == near.signerAccountId()) {
        const nftSaleInfo = this.storyNftMap.get(claimAuthorReservedNftPara.storyId.toString())
        if (claimAuthorReservedNftPara.amount + nftSaleInfo.authorClaimed <= nftSaleInfo.authorReserve) {
          const nftContractAddress = this.storyNftContractMap.get(claimAuthorReservedNftPara.storyId.toString())
          let promise = NearPromise.new(nftContractAddress)
          promise
            .transfer(near.attachedDeposit())
          for (var i = 1; i < claimAuthorReservedNftPara.amount + 1; i++) {
            promise
              .functionCall("nft_mint", bytes(JSON.stringify({ token_id: (nftSaleInfo.sold + i).toString(), receiver_id: near.signerAccountId(), token_metadata: { title: nftSaleInfo.name, description: nftSaleInfo.description, reference: nftSaleInfo.uriPrefix + "/" + (nftSaleInfo.sold + i).toString() + ".json" } })), BigInt("80000000000000000000000"), BigInt("30000000000000"))
          }
          const pubStoryNft: storyNftInfo = {
            storyId: nftSaleInfo.storyId,
            name: nftSaleInfo.name,
            image: nftSaleInfo.image,
            description: nftSaleInfo.description,
            uriPrefix: nftSaleInfo.uriPrefix,
            token: nftSaleInfo.token,
            price: nftSaleInfo.price,
            total: nftSaleInfo.total,
            authorReserve: nftSaleInfo.authorReserve,
            sold: nftSaleInfo.sold + claimAuthorReservedNftPara.amount,
            authorClaimed: nftSaleInfo.authorClaimed + claimAuthorReservedNftPara.amount
          };
          return promise.then(
            NearPromise.new(near.currentAccountId())
              .functionCall("claimAuthorReservedNft_callback", bytes(JSON.stringify({ storyNftInfo: pubStoryNft, amount: claimAuthorReservedNftPara.amount, owner_id: near.signerAccountId() })), BigInt(0), BigInt("50000000000000"))
          );;
        } else {
          return "The number of mint exceeds the set self-retained value!";
        }
      } else {
        return "Not the author!";
      }
    } else {
      return "NFT does not exist!"
    }
  }

  @call({ privateFunction: true })
  claimAuthorReservedNft_callback({ storyNftInfo, amount, owner_id }: { storyNftInfo: storyNftInfo, amount: number, owner_id: string }): boolean {
    let result: string, success: boolean;
    try { result = near.promiseResult(0); success = true }
    catch { result = undefined; success = false }

    if (success) {
      this.storyNftMap.set(storyNftInfo.storyId.toString(), storyNftInfo)
      // events
      let mintAuthorReservedNftLog = {
        standard: "nep171",
        version: "nft-1.0.0",
        event: "mint_nft",
        data: [
          {
            amount: amount,
            owner: owner_id
          }
        ]
      }
      near.log(`EVENT_JSON:${JSON.stringify(mintAuthorReservedNftLog)}`);
      return true
    } else {
      near.log("Promise failed...")
      return false
    }
  }

}