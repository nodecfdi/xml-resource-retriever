import AbstractXmlRetriever from './abstract_xml_retriever.js';

export default class XsdRetriever extends AbstractXmlRetriever {
  protected searchElements(): Record<string, string>[] {
    return [
      { element: 'import', attribute: 'schemaLocation' },
      { element: 'include', attribute: 'schemaLocation' },
    ];
  }

  protected searchNamespace(): string {
    return 'http://www.w3.org/2001/XMLSchema';
  }
}
