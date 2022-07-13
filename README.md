# `@nodecfdi/xml-resource-retriever`

[![Source Code][badge-source]][source]
[![Npm Node Version Support][badge-node-version]][node-version]
[![Discord][badge-discord]][discord]
[![Latest Version][badge-release]][release]
[![Software License][badge-license]][license]
[![Build Status][badge-build]][build]
[![Reliability][badge-reliability]][reliability]
[![Maintainability][badge-maintainability]][maintainability]
[![Code Coverage][badge-coverage]][coverage]
[![Violations][badge-violations]][violations]
[![Total Downloads][badge-downloads]][downloads]

> XSD and XLST resource downloader for local storage

## About of `@nodecfdi/xml-resource-retriever`

The purpose of this library is to download recursively XML resources from the internet to a local storage for further
usage. At this moment it only allows Schemas (XSL) and Transformations (XSLT) but is easily extensible implementing
the `RetrieverInterface` interface or extending the `AbstractXmlRetriever` class.

For every downloaded file it will override its dependence's to a relative location, in this way, every dependence should
be available to work offline.

You can use the local object `NodeDownloader` that simply uses copy function to get and store a file from internet. You
can also use your own implementation of the DownloaderInterface according to your needs. If you built a configurable and
useful downloader class feel free to contribute it to this project.

Based on php version repo: <https://github.com/eclipxe13/XmlResourceRetriever>

## Installation

```shell
npm i @nodecfdi/xml-resource-retriever --save
```

or

```shell
yarn add @nodecfdi/xml-resource-retriever
```

## Basic usage

Example with [xmldom](https://www.npmjs.com/package/@xmldom/xmldom)

```ts
import { install } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMParser, DOMImplementation } from '@xmldom/xmldom';
import { XsltRetriever } from '@nodecfdi/xml-resource-retriever';

install(new DOMParser(), new XMLSerializer(), new DOMImplementation());

const xslt = new XsltRetriever('/project/cache');
const local = await xslt.retrieve('http://www.sat.gob.mx/sitio_internet/cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt');

console.log(local); /* /project/cache/www.sat.gob.mx/sitio_internet/cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt */
```

Example with [jsdom](https://www.npmjs.com/package/jsdom)

```ts
import { install } from '@nodecfdi/cfdiutils-common';
import { JSDOM } from 'jsdom';
import { XsltRetriever } from 'nodecfdi/xml-resource-retriever';

const dom = new JSDOM();
const jsDOMParser = new dom.window.DOMParser();
const jsXMLSerializer = new dom.window.XMLSerializer();
const jsDOMImplementation = dom.window.document.implementation;
install(jsDOMParser, jsXMLSerializer, jsDOMImplementation);

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

## Soporte

Puedes obtener soporte abriendo un ticket en Github.

Adicionalmente, esta librería pertenece a la comunidad [OcelotlStudio](https://ocelotlstudio.com), así que puedes usar los mismos canales de comunicación para obtener ayuda de algún miembro de la comunidad.

## Compatibilidad

Esta librería se mantendrá compatible con al menos la versión con
[soporte activo de Node](https://nodejs.org/es/about/releases/) más reciente.

También utilizamos [Versionado Semántico 2.0.0](https://semver.org/lang/es/) por lo que puedes usar esta librería sin temor a romper tu aplicación.

## Contribuciones

Las contribuciones con bienvenidas. Por favor lee [CONTRIBUTING][] para más detalles y recuerda revisar el archivo [CHANGELOG][].

## Copyright and License

The `@nodecfdi/xml-resource-retriever` library is copyright © [NodeCfdi](https://github.com/nodecfdi) - [OcelotlStudio](https://ocelotlstudio.com) and licensed for use under the MIT License (MIT). Please see [LICENSE][] for more information.

[contributing]: https://github.com/nodecfdi/xml-resource-retriever/blob/main/CONTRIBUTING.md
[changelog]: https://github.com/nodecfdi/xml-resource-retriever/blob/main/CHANGELOG.md

[source]: https://github.com/nodecfdi/xml-resource-retriever
[node-version]: https://www.npmjs.com/package/@nodecfdi/xml-resource-retriever
[discord]: https://discord.gg/AsqX8fkW2k
[release]: https://www.npmjs.com/package/@nodecfdi/xml-resource-retriever
[license]: https://github.com/nodecfdi/xml-resource-retriever/blob/main/LICENSE
[build]: https://github.com/nodecfdi/xml-resource-retriever/actions/workflows/build.yml?query=branch:main
[reliability]:https://sonarcloud.io/component_measures?id=nodecfdi_xml-resource-retriever&metric=Reliability
[maintainability]: https://sonarcloud.io/component_measures?id=nodecfdi_xml-resource-retriever&metric=Maintainability
[coverage]: https://sonarcloud.io/component_measures?id=nodecfdi_xml-resource-retriever&metric=Coverage
[violations]: https://sonarcloud.io/project/issues?id=nodecfdi_xml-resource-retriever&resolved=false
[downloads]: https://www.npmjs.com/package/@nodecfdi/xml-resource-retriever

[badge-source]: https://img.shields.io/badge/source-nodecfdi/xml--resource--retriever-blue.svg?logo=github
[badge-node-version]: https://img.shields.io/node/v/@nodecfdi/xml-resource-retriever.svg?logo=nodedotjs
[badge-discord]: https://img.shields.io/discord/459860554090283019?logo=discord
[badge-release]: https://img.shields.io/npm/v/@nodecfdi/xml-resource-retriever.svg?logo=npm
[badge-license]: https://img.shields.io/github/license/nodecfdi/xml-resource-retriever.svg?logo=open-source-initiative
[badge-build]: https://img.shields.io/github/workflow/status/nodecfdi/xml-resource-retriever/build/main?logo=github-actions
[badge-reliability]: https://sonarcloud.io/api/project_badges/measure?project=nodecfdi_xml-resource-retriever&metric=reliability_rating
[badge-maintainability]: https://sonarcloud.io/api/project_badges/measure?project=nodecfdi_xml-resource-retriever&metric=sqale_rating
[badge-coverage]: https://img.shields.io/sonar/coverage/nodecfdi_xml-resource-retriever/main?logo=sonarcloud&server=https%3A%2F%2Fsonarcloud.io
[badge-violations]: https://img.shields.io/sonar/violations/nodecfdi_xml-resource-retriever/main?format=long&logo=sonarcloud&server=https%3A%2F%2Fsonarcloud.io
[badge-downloads]: https://img.shields.io/npm/dm/@nodecfdi/xml-resource-retriever.svg?logo=npm
