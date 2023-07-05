1. “contracts” directory
The “contracts”  warehouse stores the source code of the Near contract. They are developed by Near ts sdk. Corresponding to all the functions of UGC Editor platform, including: publishing story contents, update story contents, issuing story NFT, publish co-creation tasks, etc.

2. “server” directory
The “server” warehouse is the on-chain data synchronization service developed by nestjs framework. This service will monitor the on-chain data changes of UGC Editor, and synchronize the changes to the database. It also provide the multiple and fast query logic data acquisition functions to our website in the form of API.

3. “web” directory
The “web” warehouse store all the source codes of the UGC Editor website. The website is developed by umijs framework, using typescript and react as the technology stack.
