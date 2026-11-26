import type { SearchElement } from '../src/types.js';
import { AbstractXmlRetriever } from '../src/abstract_xml_retriever.js';

export class CommonXmlRetriever extends AbstractXmlRetriever {
  protected searchElements(): SearchElement[] {
    return [{ element: 'resource', attribute: 'href' }];
  }

  protected searchNamespace(): string {
    return 'http://example.com/ns';
  }
}
