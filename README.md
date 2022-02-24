# @nodecfdi/xml-resource-retriever

[![Source Code][badge-source]][source]
[![Software License][badge-license]][license]
[![Latest Version][badge-release]][release]
[![Discord][badge-discord]][discord]

[source]: https://github.com/nodecfdi/xml-resource-retriever

[badge-source]: https://img.shields.io/badge/source-nodecfdi%2Fxml--resource--retriever-blue?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMTIgMTIgNDAgNDAiPjxwYXRoIGZpbGw9IiMzMzMzMzMiIGQ9Ik0zMiwxMy40Yy0xMC41LDAtMTksOC41LTE5LDE5YzAsOC40LDUuNSwxNS41LDEzLDE4YzEsMC4yLDEuMy0wLjQsMS4zLTAuOWMwLTAuNSwwLTEuNywwLTMuMiBjLTUuMywxLjEtNi40LTIuNi02LjQtMi42QzIwLDQxLjYsMTguOCw0MSwxOC44LDQxYy0xLjctMS4yLDAuMS0xLjEsMC4xLTEuMWMxLjksMC4xLDIuOSwyLDIuOSwyYzEuNywyLjksNC41LDIuMSw1LjUsMS42IGMwLjItMS4yLDAuNy0yLjEsMS4yLTIuNmMtNC4yLTAuNS04LjctMi4xLTguNy05LjRjMC0yLjEsMC43LTMuNywyLTUuMWMtMC4yLTAuNS0wLjgtMi40LDAuMi01YzAsMCwxLjYtMC41LDUuMiwyIGMxLjUtMC40LDMuMS0wLjcsNC44LTAuN2MxLjYsMCwzLjMsMC4yLDQuNywwLjdjMy42LTIuNCw1LjItMiw1LjItMmMxLDIuNiwwLjQsNC42LDAuMiw1YzEuMiwxLjMsMiwzLDIsNS4xYzAsNy4zLTQuNSw4LjktOC43LDkuNCBjMC43LDAuNiwxLjMsMS43LDEuMywzLjVjMCwyLjYsMCw0LjYsMCw1LjJjMCwwLjUsMC40LDEuMSwxLjMsMC45YzcuNS0yLjYsMTMtOS43LDEzLTE4LjFDNTEsMjEuOSw0Mi41LDEzLjQsMzIsMTMuNHoiLz48L3N2Zz4%3D

[license]: https://github.com/nodecfdi/xml-resource-retriever/blob/main/LICENSE

[badge-license]: https://img.shields.io/github/license/nodecfdi/xml-resource-retriever?logo=open-source-initiative&style=flat-square

[badge-release]: https://img.shields.io/npm/v/@nodecfdi/xml-resource-retriever

[release]: https://www.npmjs.com/package/@nodecfdi/xml-resource-retriever

[badge-discord]: https://img.shields.io/discord/459860554090283019?logo=discord&style=flat-square

[discord]: https://discord.gg/aFGYXvX

> XSD and XLST resource downloader for local storage

## About of @nodecfdi/xml-resource-retriever

The purpose of this library is to download recursively XML resources from the internet to a local storage for further
usage. At this moment it only allows Schemas (XSL) and Transformations (XSLT) but is easily extensible implementing
the `RetrieverInterface` interface or extending the `AbstractXmlRetriever` class.

For every downloaded file it will override its dependence's to a relative location, in this way, every dependence should
be available to work offline.

You can use the local object `NodeDownloader` that simply uses copy function to get and store a file from internet. You
can also use your own implementation of the DownloaderInterface according to your needs. If you built a configurable and
useful downloader class feel free to contribute it to this project.

Based on php version repo: https://github.com/eclipxe13/XmlResourceRetriever

## Installation

```shell
npm i @nodecfdi/xml-resource-retriever --save
```

or

```shell
yarn add @nodecfdi/xml-resource-retriever
```

## Basic usage

```ts
import {XsltRetriever} from "@nodecfdi/xml-resource-retriever";

const xslt = new XsltRetriever('/project/cache');
const local = await xslt.retrieve('http://www.sat.gob.mx/sitio_internet/cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt');

console.log(local); /* /project/cache/www.sat.gob.mx/sitio_internet/cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt */
```

## Retriever more information

These methods apply to `XslRetriever` and `XsltRetriever`

- `retrieve(url)` Download recursively an url and store it into the retriever base path, it changes the child elements
  that contains references to other files.
- `download(url)`  Download an url and store it into the retriever base path. It does not validate the file for xml
  errors. It does not download dependence's.
- `buildPath(url)` Return the location of were a file should be stored according to the base path.
- `setDownloader(downloader)` Change the default `NodeDownloader` to a custom implementation.

`XsdRetriever` search for namespace `http://www.w3.org/2001/XMLSchema` elements `import` and `include`.

`XsltRetriever` search for namespace `http://www.w3.org/1999/XSL/Transform` elements `import` and `include`.
