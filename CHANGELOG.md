# @nodecfdi/xml-resource-retriever ChangeLog

## 1.1.1

### Change build tool from microbundle to rollup

- Change build tool
- Update dependencies
- Added api-extractor for check types `.d.ts`
- Replace microbundle to rollup
- Replace jest to vitest (added support to fast testing and multiple environment)
- Increment code coverage with missing jsdom test environment

## 1.1.0

### DOM agnostic

- Added support to DOM agnostic
- Added dependency to use @nodecfdi/cfdiutils-common

### CI

- Update workflow for use pnpm and better test coverage
- Added Sonarcloud for better continuos code quality

### Build

- Replace rollup bundle to microbundle for generation of library.

## 1.0.2

- Resolve bad encoded for files xml (need utf-8)
- Updated sat-urls.txt and fixes xsl-retriever test (works :3)
- Update GitHub workflow only one worker for jest test (no access to same time to same files)
- Fixed tsconfig.json not any and strict mode on tests files

## 1.0.1

- Update dependencies
- Small fixes on async functions
- Improve GitHub workflow CI

## 1.0.0

- First release
