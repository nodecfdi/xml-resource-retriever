import type { SearchElement } from './types.js';
import { AbstractXmlRetriever } from './abstract_xml_retriever.js';

export class XsltRetriever extends AbstractXmlRetriever {
  protected searchElements(): SearchElement[] {
    return [
      { element: 'import', attribute: 'href' },
      { element: 'include', attribute: 'href' },
    ];
  }

  protected searchNamespace(): string {
    return 'http://www.w3.org/1999/XSL/Transform';
  }
}
