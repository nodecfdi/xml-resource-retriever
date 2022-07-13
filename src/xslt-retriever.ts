import { AbstractXmlRetriever } from './abstract-xml-retriever';

export class XsltRetriever extends AbstractXmlRetriever {
    protected searchElements(): Record<string, string>[] {
        return [
            { element: 'import', attribute: 'href' },
            { element: 'include', attribute: 'href' }
        ];
    }

    protected searchNamespace(): string {
        return 'http://www.w3.org/1999/XSL/Transform';
    }
}
