import { AbstractXmlRetriever } from '~/abstract-xml-retriever';

export class CommonXmlRetriever extends AbstractXmlRetriever {
    protected searchElements(): Array<Record<string, string>> {
        return [{ element: 'resource', attribute: 'href' }];
    }

    protected searchNamespace(): string {
        return 'http://example.com/ns';
    }
}
