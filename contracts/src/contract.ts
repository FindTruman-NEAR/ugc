import {
  NearBindgen,
  near,
  call,
  view,
  UnorderedMap,
  includeBytes,
  NearPromise,
  bytes,
} from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";
import {
  story,
  updateStoryPara,
  publishStoryNftPara,
  storyNftInfo,
  claimAuthorReservedNftPara,
  createTaskPara,
  storyTaskId,
  Task,
  taskMapkey,
  updateTaskPara,
  Submit,
  withdrawTaskSubmitPara,
} from "./model";

@NearBindgen({})
class StoryFactory {
  nextStoryId: number = 1;
  storiesMap: UnorderedMap<story> = new UnorderedMap<story>("story");
  storyNftMap: UnorderedMap<storyNftInfo> = new UnorderedMap<storyNftInfo>(
    "storyNft"
  );
  storyNftContractMap: UnorderedMap<string> = new UnorderedMap<string>(
    "storyNftContract"
  );
  storyTasksIdMap: UnorderedMap<storyTaskId> = new UnorderedMap<storyTaskId>(
    "storyTasksId"
  );
  storyTasksMap: UnorderedMap<Task> = new UnorderedMap<Task>("storyTasks");
  storyTasksSubmitMap: UnorderedMap<Submit> = new UnorderedMap<Submit>(
    "storyTasksSubmit"
  );

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
      const nftSaleInfo = this.storyNftMap.get(storyId.toString());
      return (
        nftSaleInfo.total -
        nftSaleInfo.sold -
        nftSaleInfo.authorReserve +
        nftSaleInfo.authorClaimed
      ).toString();
    } else {
      return "NFT does not exist!";
    }
  }

  @view({})
  authorReservedNftRest({ storyId }: { storyId: number }): string {
    if (this.storyNftContractMap.get(storyId.toString()) != null) {
      const nftSaleInfo = this.storyNftMap.get(storyId.toString());
      return (nftSaleInfo.authorReserve - nftSaleInfo.authorClaimed).toString();
    } else {
      return "NFT does not exist!";
    }
  }

  @view({})
  get_price({ storyId }: { storyId: number }): string {
    if (this.storyNftContractMap.get(storyId.toString()) != null) {
      const nftSaleInfo = this.storyNftMap.get(storyId.toString());
      return nftSaleInfo.price.toString();
    } else {
      return "NFT does not exist!";
    }
  }

  @view({})
  get_task({ storyId, taskId }: { storyId: number; taskId: number }): any {
    const searchKey = storyId.toString() + "," + taskId.toString();
    if (this.storyTasksMap.get(searchKey) != null) {
      const taskInfo = this.storyTasksMap.get(searchKey);
      return taskInfo;
    } else {
      return "Task or Story does not exist!";
    }
  }

  @view({})
  get_submit({
    storyId,
    taskId,
    submitId,
  }: {
    storyId: number;
    taskId: number;
    submitId: number;
  }): any {
    const searchKey =
      storyId.toString() + "," + taskId.toString() + "," + submitId.toString();
    if (this.storyTasksSubmitMap.get(searchKey) != null) {
      const submitInfo = this.storyTasksSubmitMap.get(searchKey);
      return submitInfo;
    } else {
      return "Submit does not exist!";
    }
  }

  @view({})
  get_nextTaskId({ storyId }: { storyId: number }): any {
    if (this.storyTasksIdMap.get(storyId.toString()) != null) {
      const taskIdInfo = this.storyTasksIdMap.get(storyId.toString());
      return taskIdInfo.nextTaskId;
    } else {
      return "Task or Story does not exist!";
    }
  }

  @view({})
  get_nextSubmitId({
    storyId,
    taskId,
  }: {
    storyId: number;
    taskId: number;
  }): any {
    const searchKey = storyId.toString() + "," + taskId.toString();
    if (this.storyTasksMap.get(searchKey) != null) {
      const taskInfo = this.storyTasksMap.get(searchKey);
      return taskInfo.nextSubmitId;
    } else {
      return "Task or Story does not exist!";
    }
  }

  @call({})
  publishStory({ cid }: { cid: string }): UnorderedMap<story> {
    const pubStory: story = {
      author: near.signerAccountId(),
      cid: cid,
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
          thisStoryInfo: pubStory,
        },
      ],
    };
    near.log(`EVENT_JSON:${JSON.stringify(publishStoryLog)}`);
    return this.storiesMap;
  }

  @call({})
  updateStory(updateStoryPara: updateStoryPara): any {
    if (this.storiesMap.get(updateStoryPara.storyId.toString()) != null) {
      if (
        this.storiesMap.get(updateStoryPara.storyId.toString()).author ==
        near.signerAccountId()
      ) {
        this.storiesMap.set(updateStoryPara.storyId.toString(), {
          author: near.signerAccountId(),
          cid: updateStoryPara.cid,
        });
        // events
        let updateStoryLog = {
          standard: "nep171",
          version: "nft-1.0.0",
          event: "update_story",
          data: [
            {
              storyId: updateStoryPara.storyId,
              newCid: updateStoryPara.cid,
            },
          ],
        };
        near.log(`EVENT_JSON:${JSON.stringify(updateStoryLog)}`);
        return this.storiesMap.get(updateStoryPara.storyId.toString());
      } else {
        return "Not the author!";
      }
    } else {
      return "Story does not exist!";
    }
  }

  @call({ payableFunction: true })
  publishStoryNft(publishStoryNftPara: publishStoryNftPara): any {
    if (this.storiesMap.get(publishStoryNftPara.storyId.toString()) != null) {
      if (
        this.storiesMap.get(publishStoryNftPara.storyId.toString()).author ==
        near.signerAccountId()
      ) {
        let promise = NearPromise.new(
          publishStoryNftPara.storyId.toString() +
            "nftsale." +
            near.currentAccountId()
        );
        promise
          .createAccount()
          .transfer(near.attachedDeposit())
          .deployContract(includeBytes("/non_fungible_token.wasm"))
          .functionCall(
            "new_default_meta",
            bytes(JSON.stringify({ owner_id: near.currentAccountId() })),
            BigInt(0),
            BigInt("50000000000000")
          );

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
          authorClaimed: 0,
        };
        return promise.then(
          NearPromise.new(near.currentAccountId()).functionCall(
            "publishStoryNft_callback",
            bytes(
              JSON.stringify({
                storyNftInfo: pubStoryNft,
                storyNftContractAdd:
                  publishStoryNftPara.storyId.toString() +
                  "nftsale." +
                  near.currentAccountId(),
              })
            ),
            BigInt(0),
            BigInt("50000000000000")
          )
        );
      } else {
        return "Not the author!";
      }
    } else {
      return "Story does not exist!";
    }
  }

  @call({ privateFunction: true })
  publishStoryNft_callback({
    storyNftInfo,
    storyNftContractAdd,
  }: {
    storyNftInfo: storyNftInfo;
    storyNftContractAdd: string;
  }): boolean {
    let result: string, success: boolean;
    try {
      result = near.promiseResult(0);
      success = true;
    } catch {
      result = undefined;
      success = false;
    }

    if (success) {
      this.storyNftContractMap.set(
        storyNftInfo.storyId.toString(),
        storyNftContractAdd
      );
      this.storyNftMap.set(storyNftInfo.storyId.toString(), storyNftInfo);
      // events
      let publishStoryNftLog = {
        standard: "nep171",
        version: "nft-1.0.0",
        event: "publish_storyNft",
        data: [
          {
            storyId: storyNftInfo.storyId,
            nftContract: storyNftContractAdd,
          },
        ],
      };
      near.log(`EVENT_JSON:${JSON.stringify(publishStoryNftLog)}`);
      return true;
    } else {
      near.log("Promise failed...");
      return false;
    }
  }

  @call({ payableFunction: true })
  ft_on_transfer({
    sender_id,
    amount,
    msg,
  }: {
    sender_id: AccountId;
    amount: number;
    msg: string;
  }): any {
    if (sender_id == near.signerAccountId()) {
      if (this.storyNftContractMap.get(msg) != null) {
        const storyInfo = this.storiesMap.get(msg);
        const nftContractAddress = this.storyNftContractMap.get(msg);
        const nftSaleInfo = this.storyNftMap.get(msg);
        if (nftSaleInfo.price <= amount) {
          if (
            nftSaleInfo.total -
              nftSaleInfo.sold -
              nftSaleInfo.authorReserve +
              nftSaleInfo.authorClaimed >
            0
          ) {
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
              authorClaimed: nftSaleInfo.authorClaimed,
            };
            // let promise = NearPromise.new(nftContractAddress)
            //   .functionCall("nft_mint", bytes(JSON.stringify({ token_id: (nftSaleInfo.sold + 1).toString(), receiver_id: near.signerAccountId(), token_metadata: { title: nftSaleInfo.name, description: nftSaleInfo.description, reference: nftSaleInfo.uriPrefix + "/" + (nftSaleInfo.sold + 1).toString() + ".json" } })), BigInt("80000000000000000000000"), BigInt("30000000000000"))
            //   .then(NearPromise.new(near.currentAccountId()))
            //   .functionCall("ft_on_transfer_callback", bytes(JSON.stringify({ storyNftInfo: pubStoryNft, amount: amount, price: nftSaleInfo.price })), BigInt(0), BigInt("50000000000000"))
            let promise = NearPromise.new(nftSaleInfo.token)
              .functionCall(
                "ft_transfer",
                bytes(
                  JSON.stringify({
                    receiver_id: storyInfo.author,
                    amount: nftSaleInfo.price,
                  })
                ),
                BigInt("1"),
                BigInt("50000000000000")
              )
              .and(
                NearPromise.new(nftContractAddress).functionCall(
                  "nft_mint",
                  bytes(
                    JSON.stringify({
                      token_id: (nftSaleInfo.sold + 1).toString(),
                      receiver_id: near.signerAccountId(),
                      token_metadata: {
                        title: nftSaleInfo.name,
                        description: nftSaleInfo.description,
                        reference:
                          nftSaleInfo.uriPrefix +
                          "/" +
                          (nftSaleInfo.sold + 1).toString() +
                          ".json",
                      },
                    })
                  ),
                  BigInt("80000000000000000000000"),
                  BigInt("30000000000000")
                )
              ); // promise.then(NearPromise.new(near.currentAccountId()))
            //   .functionCall("ft_on_transfer_callback", bytes(JSON.stringify({ storyNftInfo: pubStoryNft, amount: amount, price: nftSaleInfo.price })), BigInt(0), BigInt("50000000000000"))

            return promise
              .then(NearPromise.new(near.currentAccountId()))
              .functionCall(
                "ft_on_transfer_callback",
                bytes(
                  JSON.stringify({
                    storyNftInfo: pubStoryNft,
                    amount: amount,
                    price: nftSaleInfo.price,
                  })
                ),
                BigInt(0),
                BigInt("50000000000000")
              );
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
  ft_on_transfer_callback({
    storyNftInfo,
    amount,
    price,
  }: {
    storyNftInfo: storyNftInfo;
    amount: number;
    price: number;
  }): any {
    let result: string, result1: string, success: boolean;
    try {
      result = near.promiseResult(0);
      success = true;
    } catch {
      result = undefined;
      success = false;
    }
    if (success) {
      // const storyInfo = this.storiesMap.get(storyNftInfo.storyId.toString())
      // let promise = NearPromise.new(storyNftInfo.token)
      //   .functionCall("ft_transfer", bytes(JSON.stringify({ receiver_id: storyInfo.author, amount: storyNftInfo.price })), BigInt("1"), BigInt("50000000000000"))
      //   .then(NearPromise.new(near.currentAccountId()))
      //   .functionCall("transfer_and_callback", bytes(JSON.stringify({ storyNftInfo: storyNftInfo, amount: amount, price: price })), BigInt(0), BigInt("50000000000000"))
      this.storyNftMap.set(storyNftInfo.storyId.toString(), storyNftInfo);
      // events
      let nftMintLog = {
        standard: "nep171",
        version: "nft-1.0.0",
        event: "mint_nft",
        data: [
          {
            storyId: storyNftInfo.storyId,
            amount: amount,
            price: price,
          },
        ],
      };
      near.log(`EVENT_JSON:${JSON.stringify(nftMintLog)}`);
      return (amount - price).toString();
    } else {
      near.log("Promise failed...");
      return amount.toString();
    }
  }

  @call({ payableFunction: true })
  claimAuthorReservedNft(
    claimAuthorReservedNftPara: claimAuthorReservedNftPara
  ): any {
    if (
      this.storyNftContractMap.get(
        claimAuthorReservedNftPara.storyId.toString()
      ) != null
    ) {
      if (
        this.storiesMap.get(claimAuthorReservedNftPara.storyId.toString())
          .author == near.signerAccountId()
      ) {
        const nftSaleInfo = this.storyNftMap.get(
          claimAuthorReservedNftPara.storyId.toString()
        );
        if (
          claimAuthorReservedNftPara.amount + nftSaleInfo.authorClaimed <=
          nftSaleInfo.authorReserve
        ) {
          const nftContractAddress = this.storyNftContractMap.get(
            claimAuthorReservedNftPara.storyId.toString()
          );
          let promise = NearPromise.new(nftContractAddress);
          promise.transfer(near.attachedDeposit());
          for (var i = 1; i < claimAuthorReservedNftPara.amount + 1; i++) {
            promise.functionCall(
              "nft_mint",
              bytes(
                JSON.stringify({
                  token_id: (nftSaleInfo.sold + i).toString(),
                  receiver_id: near.signerAccountId(),
                  token_metadata: {
                    title: nftSaleInfo.name,
                    description: nftSaleInfo.description,
                    reference:
                      nftSaleInfo.uriPrefix +
                      "/" +
                      (nftSaleInfo.sold + i).toString() +
                      ".json",
                  },
                })
              ),
              BigInt("80000000000000000000000"),
              BigInt("30000000000000")
            );
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
            authorClaimed:
              nftSaleInfo.authorClaimed + claimAuthorReservedNftPara.amount,
          };
          return promise.then(
            NearPromise.new(near.currentAccountId()).functionCall(
              "claimAuthorReservedNft_callback",
              bytes(
                JSON.stringify({
                  storyNftInfo: pubStoryNft,
                  amount: claimAuthorReservedNftPara.amount,
                  owner_id: near.signerAccountId(),
                })
              ),
              BigInt(0),
              BigInt("50000000000000")
            )
          );
        } else {
          return "The number of mint exceeds the set self-retained value!";
        }
      } else {
        return "Not the author!";
      }
    } else {
      return "NFT does not exist!";
    }
  }

  @call({ privateFunction: true })
  claimAuthorReservedNft_callback({
    storyNftInfo,
    amount,
    owner_id,
  }: {
    storyNftInfo: storyNftInfo;
    amount: number;
    owner_id: string;
  }): boolean {
    let result: string, success: boolean;
    try {
      result = near.promiseResult(0);
      success = true;
    } catch {
      result = undefined;
      success = false;
    }

    if (success) {
      this.storyNftMap.set(storyNftInfo.storyId.toString(), storyNftInfo);
      // events
      let mintAuthorReservedNftLog = {
        standard: "nep171",
        version: "nft-1.0.0",
        event: "mint_authorReservedNft",
        data: [
          {
            storyId: storyNftInfo.storyId,
            amount: amount,
            owner: owner_id,
          },
        ],
      };
      near.log(`EVENT_JSON:${JSON.stringify(mintAuthorReservedNftLog)}`);
      return true;
    } else {
      near.log("Promise failed...");
      return false;
    }
  }

  @call({})
  createTask(createTaskPara: createTaskPara): any {
    if (this.storiesMap.get(createTaskPara.storyId.toString()) != null) {
      if (
        this.storiesMap.get(createTaskPara.storyId.toString()).author ==
        near.signerAccountId()
      ) {
        let thisTaskId: number = 0;
        if (
          this.storyTasksIdMap.get(createTaskPara.storyId.toString()) == null
        ) {
          thisTaskId = 1;
        } else {
          thisTaskId = this.storyTasksIdMap.get(
            createTaskPara.storyId.toString()
          ).nextTaskId;
        }
        const storyTaskIdInfo: storyTaskId = {
          storyId: createTaskPara.storyId,
          nextTaskId: thisTaskId + 1,
        };
        this.storyTasksIdMap.set(
          createTaskPara.storyId.toString(),
          storyTaskIdInfo
        );
        const storyTaskInfo: Task = {
          id: thisTaskId,
          cid: createTaskPara.cid,
          creator: near.signerAccountId(),
          nft: createTaskPara.nft,
          rewardNfts: createTaskPara.rewardNfts,
          status: "TODO",
          nextSubmitId: 1,
        };
        // const thisTaskKey: taskMapkey = {
        //   storyId: createTaskPara.storyId,
        //   taskId:thisTaskId
        // }
        const thisTaskKey =
          createTaskPara.storyId.toString() + "," + thisTaskId.toString();
        this.storyTasksMap.set(thisTaskKey, storyTaskInfo);
        // events
        let createTaskLog = {
          standard: "nep171",
          version: "nft-1.0.0",
          event: "create_task",
          data: [
            {
              storyId: createTaskPara.storyId,
              taskId: thisTaskId,
            },
          ],
        };
        near.log(`EVENT_JSON:${JSON.stringify(createTaskLog)}`);
        return this.storyTasksMap.get(thisTaskKey);
      } else {
        return "Not the author!";
      }
    } else {
      return "Story does not exist!";
    }
  }

  @call({})
  updateTask(updateTaskPara: updateTaskPara): any {
    const searchKey =
      updateTaskPara.storyId.toString() +
      "," +
      updateTaskPara.taskId.toString();
    if (this.storyTasksMap.get(searchKey) != null) {
      if (this.storyTasksMap.get(searchKey).creator == near.signerAccountId()) {
        const thisStoryTaskInfo: Task = this.storyTasksMap.get(searchKey);
        const storyTaskInfo: Task = {
          id: thisStoryTaskInfo.id,
          cid: updateTaskPara.cid,
          creator: near.signerAccountId(),
          nft: thisStoryTaskInfo.nft,
          rewardNfts: thisStoryTaskInfo.rewardNfts,
          status: thisStoryTaskInfo.status,
          nextSubmitId: thisStoryTaskInfo.nextSubmitId,
        };
        this.storyTasksMap.set(searchKey, storyTaskInfo);
        // events
        let updateTaskLog = {
          standard: "nep171",
          version: "nft-1.0.0",
          event: "update_task",
          data: [
            {
              storyId: updateTaskPara.storyId,
              taskId: updateTaskPara.taskId,
            },
          ],
        };
        near.log(`EVENT_JSON:${JSON.stringify(updateTaskLog)}`);
        return this.storyTasksMap.get(searchKey);
      } else {
        return "Not the author!";
      }
    } else {
      return "Task does not exist!";
    }
  }

  @call({})
  cancelTask(cancelTaskPara: taskMapkey): any {
    const searchKey =
      cancelTaskPara.storyId.toString() +
      "," +
      cancelTaskPara.taskId.toString();
    if (this.storyTasksMap.get(searchKey) != null) {
      if (this.storyTasksMap.get(searchKey).creator == near.signerAccountId()) {
        const thisStoryTaskInfo: Task = this.storyTasksMap.get(searchKey);
        // Switch back to NFT
        let promise = NearPromise.new(thisStoryTaskInfo.nft);
        if (thisStoryTaskInfo.rewardNfts != "") {
          const nftIds = thisStoryTaskInfo.rewardNfts.split(",");
          for (var i = 0; i < nftIds.length; i++) {
            promise.functionCall(
              "nft_transfer",
              bytes(
                JSON.stringify({
                  receiver_id: near.signerAccountId(),
                  token_id: nftIds[i],
                })
              ),
              BigInt("1"),
              BigInt("30000000000000")
            );
          }
        }
        // update storage
        const storyTaskInfo: Task = {
          id: thisStoryTaskInfo.id,
          cid: thisStoryTaskInfo.cid,
          creator: near.signerAccountId(),
          nft: thisStoryTaskInfo.nft,
          rewardNfts: thisStoryTaskInfo.rewardNfts,
          status: "CANCELLED",
          nextSubmitId: thisStoryTaskInfo.nextSubmitId,
        };
        this.storyTasksMap.set(searchKey, storyTaskInfo);
        // events
        let cancelTaskLog = {
          standard: "nep171",
          version: "nft-1.0.0",
          event: "cancel_task",
          data: [
            {
              storyId: cancelTaskPara.storyId,
              taskId: cancelTaskPara.taskId,
            },
          ],
        };
        near.log(`EVENT_JSON:${JSON.stringify(cancelTaskLog)}`);
        return promise;
      } else {
        return "Not the author!";
      }
    } else {
      return "Task does not exist!";
    }
  }

  @call({})
  createTaskSubmit(createTaskSubmitPara: updateTaskPara): any {
    const searchKey =
      createTaskSubmitPara.storyId.toString() +
      "," +
      createTaskSubmitPara.taskId.toString();
    if (
      this.storyTasksMap.get(searchKey) != null &&
      this.storyTasksMap.get(searchKey).status == "TODO"
    ) {
      const thisSubmitId = this.storyTasksMap.get(searchKey).nextSubmitId;
      const thisSubmitInfo: Submit = {
        id: thisSubmitId,
        creator: near.signerAccountId(),
        status: "PENDING",
        cid: createTaskSubmitPara.cid,
      };
      const thisSubmitKey =
        createTaskSubmitPara.storyId.toString() +
        "," +
        createTaskSubmitPara.taskId.toString() +
        "," +
        thisSubmitId.toString();
      this.storyTasksSubmitMap.set(thisSubmitKey, thisSubmitInfo);

      const thisStoryTaskInfo: Task = this.storyTasksMap.get(searchKey);
      const storyTaskInfo: Task = {
        id: thisStoryTaskInfo.id,
        cid: thisStoryTaskInfo.cid,
        creator: thisStoryTaskInfo.creator,
        nft: thisStoryTaskInfo.nft,
        rewardNfts: thisStoryTaskInfo.rewardNfts,
        status: thisStoryTaskInfo.status,
        nextSubmitId: thisStoryTaskInfo.nextSubmitId + 1,
      };
      this.storyTasksMap.set(searchKey, storyTaskInfo);
      // events
      let createTaskSubmitLog = {
        standard: "nep171",
        version: "nft-1.0.0",
        event: "create_submit",
        data: [
          {
            storyId: createTaskSubmitPara.storyId,
            taskId: createTaskSubmitPara.taskId,
            submitId: thisSubmitId,
          },
        ],
      };
      near.log(`EVENT_JSON:${JSON.stringify(createTaskSubmitLog)}`);
      return this.storyTasksSubmitMap.get(thisSubmitKey);
    } else {
      return "Task does not exist or task is not submittable!";
    }
  }

  @call({})
  withdrawTaskSubmit(withdrawTaskSubmitPara: withdrawTaskSubmitPara): any {
    const searchKey =
      withdrawTaskSubmitPara.storyId.toString() +
      "," +
      withdrawTaskSubmitPara.taskId.toString();
    const searchSubmitKey =
      withdrawTaskSubmitPara.storyId.toString() +
      "," +
      withdrawTaskSubmitPara.taskId.toString() +
      "," +
      withdrawTaskSubmitPara.submitId.toString();
    if (
      this.storyTasksMap.get(searchKey) != null &&
      this.storyTasksMap.get(searchKey).status == "TODO"
    ) {
      const submitInfo = this.storyTasksSubmitMap.get(searchSubmitKey);
      if (submitInfo.creator == near.signerAccountId()) {
        const thisSubmitInfo: Submit = {
          id: submitInfo.id,
          creator: near.signerAccountId(),
          status: "WITHDRAWED",
          cid: submitInfo.cid,
        };
        this.storyTasksSubmitMap.set(searchSubmitKey, thisSubmitInfo);
        // events
        let cancelTaskSubmitLog = {
          standard: "nep171",
          version: "nft-1.0.0",
          event: "cancel_submit",
          data: [
            {
              storyId: withdrawTaskSubmitPara.storyId,
              taskId: withdrawTaskSubmitPara.taskId,
              submitId: withdrawTaskSubmitPara.submitId,
            },
          ],
        };
        near.log(`EVENT_JSON:${JSON.stringify(cancelTaskSubmitLog)}`);
        return this.storyTasksSubmitMap.get(searchSubmitKey);
      } else {
        return "Not the creator!";
      }
    } else {
      return "Task does not exist or task is not a modifiable state!";
    }
  }

  @call({})
  markTaskDone(markTaskDonePara: withdrawTaskSubmitPara): any {
    const searchKey =
      markTaskDonePara.storyId.toString() +
      "," +
      markTaskDonePara.taskId.toString();
    const searchSubmitKey =
      markTaskDonePara.storyId.toString() +
      "," +
      markTaskDonePara.taskId.toString() +
      "," +
      markTaskDonePara.submitId.toString();
    if (
      this.storyTasksSubmitMap.get(searchSubmitKey) == null ||
      this.storyTasksMap.get(searchKey) == null
    ) {
      return "Task or Submit does not exist!";
    }
    if (
      this.storyTasksMap.get(searchKey).status == "TODO" &&
      this.storyTasksMap.get(searchKey).creator == near.signerAccountId()
    ) {
      const submitInfo = this.storyTasksSubmitMap.get(searchSubmitKey);
      if (submitInfo.status == "PENDING") {
        const thisSubmitInfo: Submit = {
          id: submitInfo.id,
          creator: submitInfo.creator,
          status: "APPROVED",
          cid: submitInfo.cid,
        };
        this.storyTasksSubmitMap.set(searchSubmitKey, thisSubmitInfo);

        const thisStoryTaskInfo: Task = this.storyTasksMap.get(searchKey);
        const storyTaskInfo: Task = {
          id: thisStoryTaskInfo.id,
          cid: thisStoryTaskInfo.cid,
          creator: thisStoryTaskInfo.creator,
          nft: thisStoryTaskInfo.nft,
          rewardNfts: thisStoryTaskInfo.rewardNfts,
          status: "DONE",
          nextSubmitId: thisStoryTaskInfo.nextSubmitId,
        };
        this.storyTasksMap.set(searchKey, storyTaskInfo);

        // Issue rewards Nfts
        let promise = NearPromise.new(thisStoryTaskInfo.nft);
        if (thisStoryTaskInfo.rewardNfts != "") {
          const nftIds = thisStoryTaskInfo.rewardNfts.split(",");
          for (var i = 0; i < nftIds.length; i++) {
            promise.functionCall(
              "nft_transfer",
              bytes(
                JSON.stringify({
                  receiver_id: submitInfo.creator,
                  token_id: nftIds[i],
                })
              ),
              BigInt("1"),
              BigInt("30000000000000")
            );
          }
        }
        // events
        let doneTaskSubmitLog = {
          standard: "nep171",
          version: "nft-1.0.0",
          event: "done_submit",
          data: [
            {
              storyId: markTaskDonePara.storyId,
              taskId: markTaskDonePara.taskId,
              submitId: markTaskDonePara.submitId,
            },
          ],
        };
        near.log(`EVENT_JSON:${JSON.stringify(doneTaskSubmitLog)}`);
        return promise;
      } else {
        return "Submit is not pending!";
      }
    } else {
      return "Task is not a modifiable state or not the author!";
    }
  }
}
