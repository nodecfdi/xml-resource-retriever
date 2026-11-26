# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v3.0.0](https://github.com/nodecfdi/xml-resource-retriever/compare/v2.0.1...v3.0.0)

### Commits

- refactor: :recycle: update dependencies and tooling configurations [`a17401a`](https://github.com/nodecfdi/xml-resource-retriever/commit/a17401a7bff2458ff3d5d3fa3bcd06bfbc3c0bf5)
- chore: :wastebasket: remove generated documentation files [`6063e39`](https://github.com/nodecfdi/xml-resource-retriever/commit/6063e39ec9cefb9bec7b9ee4efe0b9f1dd5c186a)
- refactor: :recycle: refactor codebase with modular utilities and improved type safety [`cc87119`](https://github.com/nodecfdi/xml-resource-retriever/commit/cc871191de80fd838bc3c9d08a4a653c6facb98c)
- docs: :memo: add comprehensive documentation and quick start guide [`52adea7`](https://github.com/nodecfdi/xml-resource-retriever/commit/52adea71997c2e735ded06a98902fe6ae4955a9e)
- test: :test_tube: add unit tests for stream utils, url utils, downloader, and retriever features [`1986bee`](https://github.com/nodecfdi/xml-resource-retriever/commit/1986bee27c02083151da79a255ae7958cc30f832)
- test: :recycle: rename test files to *.test.ts, relocate test helpers and remove jest-xml [`ff8dd63`](https://github.com/nodecfdi/xml-resource-retriever/commit/ff8dd636b5a828ac056e041d36ba24c8cbccdc86)
- refactor: :recycle: migrate NodeDownloader to use global fetch and add comprehensive unit tests [`9c7d92a`](https://github.com/nodecfdi/xml-resource-retriever/commit/9c7d92aa4245a4d85a8e8984390f17503c8b0cb6)
- refactor: :recycle: resolve issues reported by sonarcloud [`86779ef`](https://github.com/nodecfdi/xml-resource-retriever/commit/86779efd170a13abc4689742eda24253cc679582)
- feat: :sparkles: implement concurrent resource downloading with concurrency limit [`b30fce8`](https://github.com/nodecfdi/xml-resource-retriever/commit/b30fce8161674361952c23aaed3b6ce855c88fc8)
- refactor: :recycle: remove old config files for tool code [`4596f95`](https://github.com/nodecfdi/xml-resource-retriever/commit/4596f95bc8661b633aac869e516609a6d1a9f2c1)
- chore: :construction: remove github workflows and update husky commit-msg command [`a278c65`](https://github.com/nodecfdi/xml-resource-retriever/commit/a278c65f01be3cf6cbcd058bc6249368fbd4f01a)
- ci: :green_heart: add GitHub Actions workflows and configure SonarCloud properties [`63b54f4`](https://github.com/nodecfdi/xml-resource-retriever/commit/63b54f4c2260664865d8a61697ad6b7321b8dbd5)
- refactor: :recycle: replace external dependency tools with native Node.js APIs [`c364f91`](https://github.com/nodecfdi/xml-resource-retriever/commit/c364f914253bf51781fd3a4b75adee5984be9547)
- refactor: :recycle: replace subpath imports with relative paths [`8c1b1e9`](https://github.com/nodecfdi/xml-resource-retriever/commit/8c1b1e937f23e01087dc45b2454b4223480b0bc7)
- test: :test_tube: handle missing local SAT XSLT fixtures with fallback downloader in tests [`7351daf`](https://github.com/nodecfdi/xml-resource-retriever/commit/7351dafc56303f8dcf38b6326ec3ae9ea4aea48b)
- refactor: :recycle: improve code style and formatting across codebase [`76875f8`](https://github.com/nodecfdi/xml-resource-retriever/commit/76875f82fbbc18ab020667407944019e06e5a4d4)
- docs: :memo: translate README to Spanish [`94fed42`](https://github.com/nodecfdi/xml-resource-retriever/commit/94fed429d06999b61f8e285c38afbdbe48d45775)
- chore: :arrow_up: migrate to pnpm workspace and update node and pnpm versions [`9008630`](https://github.com/nodecfdi/xml-resource-retriever/commit/90086306587f5b573efcbd772d386adde74d06b2)
- docs: :memo: update links and copyright information in README [`4aac862`](https://github.com/nodecfdi/xml-resource-retriever/commit/4aac86245bf30c0f779741c02faaac725fa8754b)
- test: :test_tube: resolve problem with non pass test on wsl environment [`d94b5e5`](https://github.com/nodecfdi/xml-resource-retriever/commit/d94b5e54be407f044fc9ec52962ebc8df6c50516)

## [v2.0.1](https://github.com/nodecfdi/xml-resource-retriever/compare/v2.0.0...v2.0.1) - 2024-10-14

### Commits

- chore(release): :tada: 2.0.1 [`55cd08d`](https://github.com/nodecfdi/xml-resource-retriever/commit/55cd08d32fb21cee616943e2a0d97fada778f7b7)
- test: :test_tube: update how to handle local server for retrieve files public [`8d5d08e`](https://github.com/nodecfdi/xml-resource-retriever/commit/8d5d08e192952bc1700bce326b3383c28f824362)
- test: :test_tube: increment code coverage and correct handle reject on node downloader [`ac6d7d4`](https://github.com/nodecfdi/xml-resource-retriever/commit/ac6d7d4af2f192f8a33ba48977d03d0c59b43e1b)
- perf: :building_construction: move handle error on private method for node downloader [`5907f3f`](https://github.com/nodecfdi/xml-resource-retriever/commit/5907f3f69bddda869b82a48233a8177f52a37a83)
- chore: :arrow_up: update dependencies [`e560628`](https://github.com/nodecfdi/xml-resource-retriever/commit/e56062833ac15877b990b7b67466442468962ef3)
- chore: :arrow_up: update dependencies [`b945a82`](https://github.com/nodecfdi/xml-resource-retriever/commit/b945a822717b9617222035a3b4b431cdc992b705)
- style: :rotating_light: resolve all issues report by eslint [`3f6ae51`](https://github.com/nodecfdi/xml-resource-retriever/commit/3f6ae51a1333b4e19a701cb1bbb5765ffb4699a0)
- build: :construction: remove not necessary export of package json file [`0f2499f`](https://github.com/nodecfdi/xml-resource-retriever/commit/0f2499f5d8a207254b51a3a0c240974edcbfb5f7)
- chore: :green_heart: remove usage of pool [`0dd8f82`](https://github.com/nodecfdi/xml-resource-retriever/commit/0dd8f8221c55011ae1c08353a70ae96909514c29)
- test: :construction: resolve run on single thread for better handle start, restart server [`5fae96a`](https://github.com/nodecfdi/xml-resource-retriever/commit/5fae96aeba0e5aa9d6f8941f514f60675391ef39)
- test: :construction: check if work setting pool using forks [`0f481dd`](https://github.com/nodecfdi/xml-resource-retriever/commit/0f481dd266461536c71de32a2d0afbedb9fea48f)
- style: :rotating_light: enable and apply fix on issues reported by eslint [`91e8f42`](https://github.com/nodecfdi/xml-resource-retriever/commit/91e8f42fb1f3ca55c2f739f838be915333a82b02)

## [v2.0.0](https://github.com/nodecfdi/xml-resource-retriever/compare/v1.1.1...v2.0.0) - 2024-09-18

### Merged

- Dev [`#8`](https://github.com/nodecfdi/xml-resource-retriever/pull/8)

### Commits

- docs: generate docs [`d4b22ef`](https://github.com/nodecfdi/xml-resource-retriever/commit/d4b22ef816e03293a8af3c2d9de3223a9dd8c3c9)
- refactor: remove tests files not required on repository only on ci [`162e6ef`](https://github.com/nodecfdi/xml-resource-retriever/commit/162e6ef0d36f5c39c419c608a8861087cc953e13)
- refactor: :wastebasket: remove old config files, docs and unused dirs [`d1bc3e3`](https://github.com/nodecfdi/xml-resource-retriever/commit/d1bc3e36a5cd7c17259f5676868cae3cda2cc232)
- build: :construction: generate prebuild for exports and initial doc generation [`c669adf`](https://github.com/nodecfdi/xml-resource-retriever/commit/c669adf6740921fa0e3562f1d6e3ee943995c619)
- style: :rotating_light: resolve all problem reported by linter and formatter [`3c53c6c`](https://github.com/nodecfdi/xml-resource-retriever/commit/3c53c6c31f3f44b4d2e87d073dfc6cfb93514891)
- chore(deps): update dependency typedoc to ^0.24.0 [`7ed8df8`](https://github.com/nodecfdi/xml-resource-retriever/commit/7ed8df8881f81347b7bbbe905c14fe4510b494fa)
- style: :rotating_light: add editor config and linter config, and others small development tools [`b83d7c9`](https://github.com/nodecfdi/xml-resource-retriever/commit/b83d7c9acf2acaaa6fb6350111c8bf50bcea6361)
- chore(release): :tada: 2.0.0 [`0aaf1ee`](https://github.com/nodecfdi/xml-resource-retriever/commit/0aaf1eeb3fbf0f679d221d925fb68cefc6a61286)
- chore(deps): update vitest monorepo to ^0.33.0 [`77713e9`](https://github.com/nodecfdi/xml-resource-retriever/commit/77713e91bf86717ada3a31319180ec5f7289d7a0)
- chore(deps): update vitest monorepo to ^0.31.0 [`fa22c58`](https://github.com/nodecfdi/xml-resource-retriever/commit/fa22c587a51a430628c52a0f709f9c234cf02585)
- build: :construction: prebuild with support to commonjs [`77f298e`](https://github.com/nodecfdi/xml-resource-retriever/commit/77f298e9bd587935a5b1eec6c419be1a970d33a4)
- ci: :green_heart: update workflows and husky hook for better commit msg [`95f6106`](https://github.com/nodecfdi/xml-resource-retriever/commit/95f6106f6eeee0903993bef184ec5609eb95eabc)
- test: :bug: resolve bad recursive delete dirs and usage of rimraf [`12fad4e`](https://github.com/nodecfdi/xml-resource-retriever/commit/12fad4ec53f73c09f5314841d981c73d16f0df77)
- docs: :memo: update readme with link to official documentation [`239c629`](https://github.com/nodecfdi/xml-resource-retriever/commit/239c629370b1cc79e2a0488cf8f0b5bec93091d3)
- chore(deps): update vitest monorepo to ^0.32.0 [`5212e70`](https://github.com/nodecfdi/xml-resource-retriever/commit/5212e704c3193dabc083f02d0f1be2a5179b6622)
- chore(deps): update vitest monorepo to ^0.29.0 [`2cd0a70`](https://github.com/nodecfdi/xml-resource-retriever/commit/2cd0a7056feab6fa1ccd3bbf53b40a5f7fb3f014)
- test: :memo: update readme for public node internal web server [`9a56361`](https://github.com/nodecfdi/xml-resource-retriever/commit/9a56361abb8dcf5c8f606d02e37c98f5f3da9c03)
- refactor: :wastebasket: remove old config files, docs and unused dirs [`199b279`](https://github.com/nodecfdi/xml-resource-retriever/commit/199b279c8fa23b2ca8a70f2481fa131992c84b6b)
- chore(deps): update dependency eslint-config-xo-typescript to ^0.56.0 [`26d7804`](https://github.com/nodecfdi/xml-resource-retriever/commit/26d780477f8f90d902b244085a39d3cc229870fd)
- test: :adhesive_bandage: resolve problem with handle multiple threads and build paths clear [`4185c57`](https://github.com/nodecfdi/xml-resource-retriever/commit/4185c571379a8487bf73bdd9488ec233344d032e)
- chore: update gitignore added not detect others files only ts files [`cc409a0`](https://github.com/nodecfdi/xml-resource-retriever/commit/cc409a0cae8a55c05bc82bccd809f7ad03b7253b)
- docs: :memo: update license 2024 happy new year [`6afe2fa`](https://github.com/nodecfdi/xml-resource-retriever/commit/6afe2fafd554d943ec41e27c618ec7ef516b859a)

## [v1.1.1](https://github.com/nodecfdi/xml-resource-retriever/compare/v1.1.0...v1.1.1) - 2023-01-31

### Merged

- chore: version bump 1.1.1 [`#7`](https://github.com/nodecfdi/xml-resource-retriever/pull/7)

### Commits

- chore: update deps, update build tool from microbundle to rollup and add api-extractor [`f608948`](https://github.com/nodecfdi/xml-resource-retriever/commit/f6089488bd7b41a14356f17d7623716a3bbdecd4)
- docs: generate docs [`0def8e4`](https://github.com/nodecfdi/xml-resource-retriever/commit/0def8e4b7387fa889f68366e91ed2a978d516c4e)
- chore: apply lint fixes and increment code coverage [`58bec7f`](https://github.com/nodecfdi/xml-resource-retriever/commit/58bec7f79481f8b6dedae754f4b591a7a5c24a08)
- test: increment code coverage and added jsdom cases [`569d881`](https://github.com/nodecfdi/xml-resource-retriever/commit/569d8811eacc4cbb66aaef219919a462901b72db)
- ci: update workflows with new scripts and github updates [`1ac8391`](https://github.com/nodecfdi/xml-resource-retriever/commit/1ac8391fa95a388ff65a7fa38b10f2a0a133ea0b)
- refactor: remove old config files [`3f6120f`](https://github.com/nodecfdi/xml-resource-retriever/commit/3f6120f06632281277dcfb29d755616348cad3f4)
- docs: update readme with fixed badge-build and installation alternatives [`a458ca5`](https://github.com/nodecfdi/xml-resource-retriever/commit/a458ca54ffcc8875f6ff76c78eeb5ce9fbd23375)
- docs: update license year 2023, happy new year! [`5315f34`](https://github.com/nodecfdi/xml-resource-retriever/commit/5315f3453b62a55f0f4777cd8115bd0943acd1e5)

## [v1.1.0](https://github.com/nodecfdi/xml-resource-retriever/compare/v1.0.2...v1.1.0) - 2022-07-13

### Merged

- Version bump 1.1.0 [`#2`](https://github.com/nodecfdi/xml-resource-retriever/pull/2)

### Commits

- refactor: change from rollup to microbundle configs [`035343c`](https://github.com/nodecfdi/xml-resource-retriever/commit/035343c6a8bee954c16ba53b8dab9edb2957d180)
- refactor: remove old doc [`e4f00f9`](https://github.com/nodecfdi/xml-resource-retriever/commit/e4f00f9714c31c1882ff46d37020668f33963750)
- test: refactor on test and added settings for new configs [`8ec73e5`](https://github.com/nodecfdi/xml-resource-retriever/commit/8ec73e5dfeec60a09675d77e5d02881e35c571e1)
- ci: update workflows, include sonarcloud [`311027a`](https://github.com/nodecfdi/xml-resource-retriever/commit/311027af9cc94bfd1ed2b85aadab18a0df396191)
- chore(lint): apply refactor and linter problems on src [`fdd0058`](https://github.com/nodecfdi/xml-resource-retriever/commit/fdd005834bd16e57e31796245ac8e2a5f9b20b47)
- docs: update readme examples and badges [`02a14ef`](https://github.com/nodecfdi/xml-resource-retriever/commit/02a14ef52f3d34e1964b36ea6a236ac9ac942e41)
- chore: added commitlint, changeset and VSCODE DEBUG [`a1a33f8`](https://github.com/nodecfdi/xml-resource-retriever/commit/a1a33f83774234d50abb03b6db5b387d186277dd)
- chore: version bump [`6da8980`](https://github.com/nodecfdi/xml-resource-retriever/commit/6da8980d2d47ebb5cc47dc7c93d7061b1a07be36)
- chore(deps): update dependencies jest [`f199579`](https://github.com/nodecfdi/xml-resource-retriever/commit/f199579744d563fcfed6722e377f8f0aa6ad81e2)
- ci: fixed bad repo target on consume changeset [`2e1803d`](https://github.com/nodecfdi/xml-resource-retriever/commit/2e1803d1a107d12e84eaf577486cd3532683a85d)
- ci: ignore node version 12 is not manteined for this library [`b321ad1`](https://github.com/nodecfdi/xml-resource-retriever/commit/b321ad194fd698b88e1f967044f59080d32eb2d4)

## [v1.0.2](https://github.com/nodecfdi/xml-resource-retriever/compare/v1.0.1...v1.0.2) - 2022-03-03

### Commits

- docs: prepare docs for release version 1.0.2 [`0c27852`](https://github.com/nodecfdi/xml-resource-retriever/commit/0c27852c0f01720b3818fe3cdd2c6d11177ceff3)
- fix: bad encoded, update sat url, and enable again Xslt-Retriever test [`d0143aa`](https://github.com/nodecfdi/xml-resource-retriever/commit/d0143aaea50e60e4be4ef5ca3e9cfc8ccef08930)
- chore: update workflow to test jest only run on one worker [`a1a4dbd`](https://github.com/nodecfdi/xml-resource-retriever/commit/a1a4dbdc6af6260f1b6f50288fefb9ac82c5e1e9)

## v1.0.1 - 2022-03-03

### Commits

- docs: prepare docs files for first release version v.1.0.0 [`8b30380`](https://github.com/nodecfdi/xml-resource-retriever/commit/8b303807174a32f4e7e873b147406c15074af420)
- chore: initial commit [`94fcdd3`](https://github.com/nodecfdi/xml-resource-retriever/commit/94fcdd3ec620ca902404409087bd1f31283ae2ed)
- chore: fixed test has expected url-sat.txt [`6a091da`](https://github.com/nodecfdi/xml-resource-retriever/commit/6a091daad8bc4eea108b851f692cc102e1293c14)
- docs: prepare docs for release 1.0.1 [`21d687a`](https://github.com/nodecfdi/xml-resource-retriever/commit/21d687a47f7ad792ce5863c1bbaf03de7342ba58)
- docs: version 1.0.0 [`7fadbb2`](https://github.com/nodecfdi/xml-resource-retriever/commit/7fadbb288792af40411b8679bdb1f1e1c8e2b052)
- chore: added GitHub Action workflow [`396c0d7`](https://github.com/nodecfdi/xml-resource-retriever/commit/396c0d7eca71418f9579819c36a8605d36e71281)
- chore: fixes for pass on windows os [`f31c540`](https://github.com/nodecfdi/xml-resource-retriever/commit/f31c54011dd144842d694a20c0030ff41925ec49)
- test: added local server for handling files on public (first attempt to build workflow) [`259e377`](https://github.com/nodecfdi/xml-resource-retriever/commit/259e3773e0ea690a85c3c79acafacb05dfd53fce)
- chore: apply new rules on eslint and refactor codes with problems [`77623e8`](https://github.com/nodecfdi/xml-resource-retriever/commit/77623e897a851cab45eae0d9f059c04486eec778)
- chore: second intent to fixed workflow [`67544fe`](https://github.com/nodecfdi/xml-resource-retriever/commit/67544fe7fa358a150683779cf5c3e93850887106)
- chore: first attempt to build with local server [`125e844`](https://github.com/nodecfdi/xml-resource-retriever/commit/125e844d73d8da5e93355f76539e9905053d9d78)
- chore: remove not target os (windows) for handling paths and commands usage only support linux [`577dfe1`](https://github.com/nodecfdi/xml-resource-retriever/commit/577dfe14cddf0da3af9bdacce5e858ab6b940c83)
- chore: last intent to fixed workflow [`966d12a`](https://github.com/nodecfdi/xml-resource-retriever/commit/966d12a55b53533f5c0a61d0192d4345f2897d2a)
- chore: updated gitignore to ignore tests/public/www.sat.gob.mx files [`2f51cb1`](https://github.com/nodecfdi/xml-resource-retriever/commit/2f51cb17d75e74d8e8ec9448ffef384455a37775)
