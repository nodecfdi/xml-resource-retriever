import AbstractXmlRetriever from '#src/abstract_xml_retriever';

export default class CommonXmlRetriever extends AbstractXmlRetriever {
  protected searchElements(): Record<string, string>[] {
    return [{ element: 'resource', attribute: 'href' }];
  }

  protected searchNamespace(): string {
    return 'http://example.com/ns';
  }
}
