import type { SearchElement } from './types.js';
import { AbstractXmlRetriever } from './abstract_xml_retriever.js';

export class XsdRetriever extends AbstractXmlRetriever {
  protected searchElements(): SearchElement[] {
    return [
      { element: 'import', attribute: 'schemaLocation' },
      { element: 'include', attribute: 'schemaLocation' },
    ];
  }

  protected searchNamespace(): string {
    return 'http://www.w3.org/2001/XMLSchema';
  }
}
