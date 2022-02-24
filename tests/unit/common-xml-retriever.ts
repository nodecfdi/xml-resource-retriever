import { AbstractXmlRetriever } from '../../src';

export class CommonXmlRetriever extends AbstractXmlRetriever {
    protected searchElements(): Record<string, string>[] {
        return [{ element: 'resource', attribute: 'href' }];
    }

    protected searchNamespace(): string {
        return 'http://example.com/ns';
    }
}
