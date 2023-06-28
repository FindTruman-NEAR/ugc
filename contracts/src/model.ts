export class story {
  author: string;
  cid: string;
}

export class updateStoryPara {
  storyId: number;
  cid: string;
}

export class publishStoryNftPara {
  storyId: number;
  name: string;
  image: string;
  description: string;
  uriPrefix: string;
  token: string;
  price: number;
  total: number;
  authorReserve: number;
}

export class storyNftInfo {
  storyId: number;
  name: string;
  image: string;
  description: string;
  uriPrefix: string;
  token: string;
  price: number;
  total: number;
  authorReserve: number;
  sold: number;
  authorClaimed: number;
}

export class claimAuthorReservedNftPara {
  storyId: number;
  amount: number;
}

export class createTaskPara {
  storyId: number;
  cid: string;
  nft: string;
  rewardNfts: string;
}

export class storyTaskId {
  storyId: number;
  nextTaskId: number;
}

export class Task {
  id: number;
  cid: string;
  creator: string;
  nft: string;
  rewardNfts: string;
  status: string;
  nextSubmitId: number;
}

export class taskMapkey {
  storyId: number;
  taskId: number;
}

export class updateTaskPara {
  storyId: number;
  taskId: number;
  cid: string;
}

export class Submit {
  id: number;
  creator: string;
  status: string;
  cid: string;
}

export class withdrawTaskSubmitPara {
  storyId: number;
  taskId: number;
  submitId: number;
}
