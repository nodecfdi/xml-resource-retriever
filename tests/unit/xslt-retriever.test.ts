import 'jest-xml-matcher';
import { useTestCase } from '../test-case';
import { useRetrieverTestCase } from './retriever-test-case';
import { XsltRetriever } from '../../src';
import { existsSync } from 'fs';

describe('XsltRetriever', () => {
    const { fileContents, testIf } = useTestCase();
    const { buildPath, pathToClear, assetPath, publicPath } = useRetrieverTestCase();

    test('retrieve recursive', async () => {
        const localPath = buildPath('recursive');
        pathToClear(localPath);
        const retriever = new XsltRetriever(localPath);
        const remote = 'http://localhost:8999/xslt/entities/ticket.xslt';
        const expectedRemotes = [
            retriever.buildPath(remote),
            retriever.buildPath('http://localhost:8999/xslt/articles/books.xslt'),
        ];

        // verify path of downloaded file
        const local = await retriever.retrieve(remote);
        expect(local).toBe(expectedRemotes[0]);

        // verify file exists
        for (const expectedRemote of expectedRemotes) {
            expect(existsSync(expectedRemote)).toBeTruthy();
        }

        // get string content xml for compare
        const assetXml = fileContents(assetPath('expected-ticket.xslt'));
        const localXml = fileContents(local);

        expect(localXml).toEqualXML(assetXml);
    });

    testIf(existsSync(publicPath('www.sat.gob.mx')))('retrieve complex structure', async () => {
        const localPath = buildPath('SATXSLT');
        pathToClear(localPath);
        const remotePrefix = 'http://localhost:8999/www.sat.gob.mx/sitio_internet/';
        const remote = `${remotePrefix}cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt`;
        const retriever = new XsltRetriever(localPath);
        const expectedRemotes = [
            'cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt',
            'cfd/2/cadenaoriginal_2_0/utilerias.xslt',
            'cfd/EstadoDeCuentaCombustible/ecc11.xslt',
            'cfd/donat/donat11.xslt',
            'cfd/divisas/divisas.xslt',
            'cfd/implocal/implocal.xslt',
            'cfd/leyendasFiscales/leyendasFisc.xslt',
            'cfd/pfic/pfic.xslt',
            'cfd/TuristaPasajeroExtranjero/TuristaPasajeroExtranjero.xslt',
            'cfd/nomina/nomina12.xslt',
            'cfd/cfdiregistrofiscal/cfdiregistrofiscal.xslt',
            'cfd/pagoenespecie/pagoenespecie.xslt',
            'cfd/aerolineas/aerolineas.xslt',
            'cfd/valesdedespensa/valesdedespensa.xslt',
            'cfd/consumodecombustibles/consumodecombustibles.xslt',
            'cfd/notariospublicos/notariospublicos.xslt',
            'cfd/vehiculousado/vehiculousado.xslt',
            'cfd/servicioparcialconstruccion/servicioparcialconstruccion.xslt',
            'cfd/renovacionysustitucionvehiculos/renovacionysustitucionvehiculos.xslt',
            'cfd/certificadodestruccion/certificadodedestruccion.xslt',
            'cfd/arteantiguedades/obrasarteantiguedades.xslt',
            'cfd/ComercioExterior11/ComercioExterior11.xslt',
            'cfd/ine/ine11.xslt',
            'cfd/iedu/iedu.xslt',
            'cfd/ventavehiculos/ventavehiculos11.xslt',
            'cfd/terceros/terceros11.xslt',
            'cfd/Pagos/Pagos10.xslt',
        ];

        // verify path of downloaded file
        await retriever.retrieve(remote);

        // verify file exists
        for (const expectedRemote of expectedRemotes) {
            expect(existsSync(retriever.buildPath(`${remotePrefix}${expectedRemote}`))).toBeTruthy();
        }
    });
});
