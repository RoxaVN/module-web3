# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.6](https://github.com/RoxaVN/roxavn/compare/v0.1.5...v0.1.6) (2023-12-13)

### Features

- add params to GetWeb3EventsRequest ([cdfb7df](https://github.com/RoxaVN/roxavn/commit/cdfb7dfef2fad7d50e201aa6a8246d73591befe0))
- add shortenAddress() ([71574e3](https://github.com/RoxaVN/roxavn/commit/71574e364e9d663c1207e098411b3ad7ea5b98cf))

### Bug Fixes

- correct interval time ([6cdfea5](https://github.com/RoxaVN/roxavn/commit/6cdfea561b6da6395df63a85d73f9ece40ffdc30))

### [0.1.5](https://github.com/RoxaVN/roxavn/compare/v0.1.4...v0.1.5) (2023-12-06)

### Features

- add unique (blockNumber, logIndex, networkId) for Web3Event table ([8d499e6](https://github.com/RoxaVN/roxavn/commit/8d499e6a513a4af79e127025b627add270da718f))

### Bug Fixes

- correct lastBlockNumber ([c39346a](https://github.com/RoxaVN/roxavn/commit/c39346a7e3af577a2716ac3e29bbe176b0353ce0))
- display transactionHash ([c8b731f](https://github.com/RoxaVN/roxavn/commit/c8b731f1f3f12e08ec9960fcfa2e7cb5b887f5fc))
- save lastBlockNumber for contract instead of provider ([d730284](https://github.com/RoxaVN/roxavn/commit/d730284cfd430ad78616650e9983b07fc74ec364))
- save lastBlockNumber in provider ([6377e08](https://github.com/RoxaVN/roxavn/commit/6377e08b6666eb101dec9f5b5d1928f323ea5f44))
- wrong return type of getContractConfig() ([401689d](https://github.com/RoxaVN/roxavn/commit/401689d23a1c83c43039df274bf3df6fac4722a4))

### [0.1.4](https://github.com/RoxaVN/roxavn/compare/v0.1.3...v0.1.4) (2023-11-21)

### Features

- add contractId translation ([dd65906](https://github.com/RoxaVN/roxavn/commit/dd65906723c851d77944dcb5b46e4df467793248))
- add networkId param to GetWeb3ProvidersRequest ([7747fa1](https://github.com/RoxaVN/roxavn/commit/7747fa10f67fd6b96e5a28d01241d3bcad2c0904))

### [0.1.3](https://github.com/RoxaVN/roxavn/compare/v0.1.2...v0.1.3) (2023-11-11)

### Features

- add address/ networkId params to GetWeb3ContractsRequest ([aa68285](https://github.com/RoxaVN/roxavn/commit/aa68285f248c8c70b2b47c9b67799af1aa04cd9d))
- add getContractConfig/ getPublicClient to Web3EventConsumersService ([711286f](https://github.com/RoxaVN/roxavn/commit/711286f4606f2cd402fd224f86ecd4e25376f7c6))
- add getCrawler() to ConsumeWeb3EventService ([705b9ce](https://github.com/RoxaVN/roxavn/commit/705b9ced79c94096a635f3ed5032b7e48e80339e))
- add id to CreateWeb3EventCrawlerRequest ([e0bce54](https://github.com/RoxaVN/roxavn/commit/e0bce546fce656f21a240b88da2b03011dc4a2c3))
- add maxEventsPerConsume to Web3EventConsumersService ([b780fae](https://github.com/RoxaVN/roxavn/commit/b780fae23585732e739ca80aade8115cc6ae9423))
- add unique index for Web3Contract ([177e422](https://github.com/RoxaVN/roxavn/commit/177e422f3a3d91a8e92e733d77ebbb7e2cbf64a1))
- add utils ([00437b3](https://github.com/RoxaVN/roxavn/commit/00437b39d4b59096217f51f25dd192608ce0f381))
- not use transactionHash as primary key ([c3b77db](https://github.com/RoxaVN/roxavn/commit/c3b77db5ff984d588f509a356f349fa7a07f0810))
- update web3modal to v3 ([76d9e61](https://github.com/RoxaVN/roxavn/commit/76d9e614062c0fa1cba7c6b8871e81248875152a))
- use viem instead of web3 ([14b9689](https://github.com/RoxaVN/roxavn/commit/14b96899e86e062e6c69bfb4eb99489f90e8224c))

### Bug Fixes

- can't use Web3Modal in AppProvider ([2fb1548](https://github.com/RoxaVN/roxavn/commit/2fb154819e80278c22e076c6be06fdcdd9457ffb))
- commit every consume event ([2fe3b10](https://github.com/RoxaVN/roxavn/commit/2fe3b1077bfa06754f363e3d0cf7f3bee84afc80))
- not use transactional when consume every event ([a3be0b9](https://github.com/RoxaVN/roxavn/commit/a3be0b9ad86966abd761d355047d4e33c197ae8e))
- work with typeorm-transactional ([278a1a5](https://github.com/RoxaVN/roxavn/commit/278a1a530bacf894664048f36fa1f87e60b79466))
- wrong propagation in transaction ([2ff97bc](https://github.com/RoxaVN/roxavn/commit/2ff97bc4282cada9a44fc6c2cddd0f2ebf8ba9cd))

### 0.1.2 (2023-08-25)

### Features

- init module ([68be535](https://github.com/RoxaVN/roxavn/commit/68be5359eab16328a8c50ffe4bc6a06ede6b3eeb))

### Bug Fixes

- cannot read file tsconfig.json ([20e44c8](https://github.com/RoxaVN/roxavn/commit/20e44c8e9f1c843291fbabc20209053e1c9b8d80))
