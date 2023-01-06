export class story {
    author: string;
    cid: string;
  };
  
  export class updateStoryPara {
    storyId: number;
    cid: string;
  };
  
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
  };
  
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
  };
  
  export class claimAuthorReservedNftPara {
    storyId: number;
    amount: number;
  };