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

:us: The documentation of this project is in spanish as this is the natural language for intended audience.

:mexico: La documentación del proyecto está en español porque ese es el lenguaje principal de los usuarios.

## Acerca de `@nodecfdi/xml-resource-retriever`

El propósito de esta librería es descargar recursivamente recursos XML desde internet a un almacenamiento local para su
uso posterior. Por el momento solo permite Esquemas (XSL) y Transformaciones (XSLT), pero es fácilmente extensible
implementando la interfaz `RetrieverInterface` o extendiendo la clase `AbstractXmlRetriever`.

Para cada archivo descargado sobrescribirá sus dependencias a una ubicación relativa; de esta manera, cada dependencia
estará disponible para trabajar sin conexión.

Puedes usar el objeto local `NodeDownloader` que simplemente utiliza la función de copia para obtener y almacenar un
archivo desde internet. También puedes usar tu propia implementación de `DownloaderInterface` según tus necesidades.
Si creaste una clase descargadora configurable y útil, siéntete libre de contribuir con ella a este proyecto.

Basado en el repositorio de la versión PHP: https://github.com/eclipxe13/XmlResourceRetriever

## Inicio rápido

Instala el paquete con tu gestor preferido:

```bash
# pnpm
pnpm add @nodecfdi/xml-resource-retriever

# npm
npm install @nodecfdi/xml-resource-retriever

# yarn
yarn add @nodecfdi/xml-resource-retriever

# bun
bun add @nodecfdi/xml-resource-retriever
```

Descarga un esquema XSD y todas sus dependencias de forma recursiva:

```ts
import { XsdRetriever } from '@nodecfdi/xml-resource-retriever';

const retriever = new XsdRetriever('./storage');
const localPath = await retriever.retrieve('http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd');

console.log(localPath);
```

## Documentación

La documentación está disponible en el sitio web [NodeCfdi](https://nodecfdi.com/packages/xml-resource-retriever/getting-started/)

## Soporte

Puedes obtener soporte abriendo un ticket en Github.

## Compatibilidad

Esta librería se mantendrá compatible con al menos la versión con
[soporte activo de Node](https://nodejs.org/es/about/releases/) más reciente.

También utilizamos [Versionado Semántico 2.0.0](https://semver.org/lang/es/) por lo que puedes usar esta librería sin temor a romper tu aplicación.

## Contribuciones

Las contribuciones con bienvenidas. Por favor lee [CONTRIBUTING][] para más detalles y recuerda revisar el archivo [CHANGELOG][].

## Copyright y Licencia

La librería `@nodecfdi/xml-resource-retriever` tiene derechos de autor ©[NodeCfdi](https://github.com/nodecfdi) y está licenciada para su uso bajo la licencia (MIT). Por favor, consulta [LICENSE][] para más información.

[contributing]: https://github.com/nodecfdi/.github/blob/main/docs/CONTRIBUTING.md
[changelog]: https://github.com/nodecfdi/xml-resource-retriever/blob/main/CHANGELOG.md
[source]: https://github.com/nodecfdi/xml-resource-retriever
[node-version]: https://www.npmjs.com/package/@nodecfdi/xml-resource-retriever
[discord]: https://discord.gg/AsqX8fkW2k
[release]: https://www.npmjs.com/package/@nodecfdi/xml-resource-retriever
[license]: https://github.com/nodecfdi/xml-resource-retriever/blob/main/LICENSE
[build]: https://github.com/nodecfdi/xml-resource-retriever/actions/workflows/build.yml?query=branch:main
[reliability]: https://sonarcloud.io/component_measures?id=nodecfdi_xml-resource-retriever&metric=Reliability
[maintainability]: https://sonarcloud.io/component_measures?id=nodecfdi_xml-resource-retriever&metric=Maintainability
[coverage]: https://sonarcloud.io/component_measures?id=nodecfdi_xml-resource-retriever&metric=Coverage
[violations]: https://sonarcloud.io/project/issues?id=nodecfdi_xml-resource-retriever&resolved=false
[downloads]: https://www.npmjs.com/package/@nodecfdi/xml-resource-retriever
[badge-source]: https://img.shields.io/badge/source-nodecfdi/xml--resource--retriever-blue.svg?logo=github
[badge-node-version]: https://img.shields.io/node/v/@nodecfdi/xml-resource-retriever.svg?logo=nodedotjs
[badge-discord]: https://img.shields.io/discord/459860554090283019?logo=discord
[badge-release]: https://img.shields.io/npm/v/@nodecfdi/xml-resource-retriever.svg?logo=npm
[badge-license]: https://img.shields.io/github/license/nodecfdi/xml-resource-retriever.svg?logo=open-source-initiative
[badge-build]: https://img.shields.io/github/actions/workflow/status/nodecfdi/xml-resource-retriever/build.yml?branch=main&logo=github-actions
[badge-reliability]: https://sonarcloud.io/api/project_badges/measure?project=nodecfdi_xml-resource-retriever&metric=reliability_rating
[badge-maintainability]: https://sonarcloud.io/api/project_badges/measure?project=nodecfdi_xml-resource-retriever&metric=sqale_rating
[badge-coverage]: https://img.shields.io/sonar/coverage/nodecfdi_xml-resource-retriever/main?logo=sonarcloud&server=https%3A%2F%2Fsonarcloud.io
[badge-violations]: https://img.shields.io/sonar/violations/nodecfdi_xml-resource-retriever/main?format=long&logo=sonarcloud&server=https%3A%2F%2Fsonarcloud.io
[badge-downloads]: https://img.shields.io/npm/dm/@nodecfdi/xml-resource-retriever.svg?logo=npm
