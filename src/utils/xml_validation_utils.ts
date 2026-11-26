import { stat, unlink } from 'node:fs/promises';
import { fileTypeFromFile } from 'file-type';
import mime from 'mime';

export const stripUtf8Bom = (content: string): string =>
  content.startsWith('\u{FEFF}') ? content.slice(1) : content;

export const isXmlMimeType = (mimeType: string | undefined): boolean =>
  mimeType === 'application/xml'
  || Boolean(mimeType?.endsWith('+xml'))
  || Boolean(mimeType?.startsWith('text/'));

export const validateDownloadedXmlFile = async (
  source: string,
  localPath: string,
): Promise<void> => {
  const statsFile = await stat(localPath);
  if (statsFile.size === 0) {
    await unlink(localPath);
    throw new Error(`The source ${source} is not an xml file because it is empty`);
  }

  const result = await fileTypeFromFile(localPath);
  const mimeType = result?.mime ?? mime.getType(localPath) ?? undefined;

  if (isXmlMimeType(mimeType)) {
    return;
  }

  await unlink(localPath);
  throw new Error(`The source ${source} (${mimeType ?? 'unknown'}) is not an xml file`);
};
