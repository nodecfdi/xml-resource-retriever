import type { Element } from '@nodecfdi/cfdi-core';
import { DOMParser, Node, XMLSerializer } from '@nodecfdi/cfdi-core';
import { expect } from 'vitest';

const serializer = new XMLSerializer();

const escapeXmlText = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const escapeXmlAttr = (value: string): string =>
  escapeXmlText(value).replaceAll('"', '&quot;');

const formatNode = (node: Node, indent: number): string => {
  const pad = '  '.repeat(indent);

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const attrs = [...element.attributes]
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .map((attr) => ` ${attr.name}="${escapeXmlAttr(attr.value)}"`)
      .join('');

    const children = [...element.childNodes].filter((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        return (child.nodeValue ?? '').trim() !== '';
      }

      return (
        child.nodeType === Node.ELEMENT_NODE
        || child.nodeType === Node.CDATA_SECTION_NODE
        || child.nodeType === Node.COMMENT_NODE
      );
    });

    if (children.length === 0) {
      return `${pad}<${element.tagName}${attrs}/>`;
    }

    if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
      return `${pad}<${element.tagName}${attrs}>${escapeXmlText(children[0].nodeValue ?? '')}</${element.tagName}>`;
    }

    const formattedChildren = children.map((child) => formatNode(child, indent + 1)).join('\n');

    return `${pad}<${element.tagName}${attrs}>\n${formattedChildren}\n${pad}</${element.tagName}>`;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return `${pad}${escapeXmlText((node.nodeValue ?? '').trim())}`;
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${pad}<![CDATA[${node.nodeValue ?? ''}]]>`;
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${node.nodeValue ?? ''}-->`;
  }

  return `${pad}${serializer.serializeToString(node)}`;
};

const parseXmlRoot = (xml: string): Node | null => {
  const trimmed = xml.trim();
  const body = trimmed.replace(/^<\?xml[^?]*\?>\s*/i, '');
  const declaredPrefixes = new Set(
    body.matchAll(/\bxmlns:([a-z_][\w.-]*)=/gi).map((m) => m[1]),
  );
  const usedPrefixes = new Set(
    body.matchAll(/(?:<\/?|\s)([a-z_][\w.-]*):[a-z_][\w.-]*/gi).map((m) => m[1]),
  );
  const missingPrefixes = [...usedPrefixes].filter(
    (prefix) => prefix !== 'xml' && prefix !== 'xmlns' && !declaredPrefixes.has(prefix),
  );

  if (missingPrefixes.length === 0) {
    return new DOMParser().parseFromString(trimmed, 'text/xml').documentElement;
  }

  const nsDeclarations = missingPrefixes
    .map((prefix) => `xmlns:${prefix}="urn:xml-matcher:${prefix}"`)
    .join(' ');
  const wrapped = `<__xml_matcher_root__ ${nsDeclarations}>${body}</__xml_matcher_root__>`;
  const doc = new DOMParser().parseFromString(wrapped, 'text/xml');
  const rootChildren = [...(doc.documentElement?.childNodes ?? [])];

  return rootChildren.find((child) => child.nodeType === Node.ELEMENT_NODE) ?? null;
};

export const formatXml = (xml: string): string => {
  const root = parseXmlRoot(xml);
  if (!root) {
    return xml.trim();
  }

  return formatNode(root, 0);
};

export const toEqualXML = (
  received: string,
  expected: string,
): {
  pass: boolean;
  message: () => string;
  actual: string;
  expected: string;
} => {
  const formattedReceived = formatXml(received);
  const formattedExpected = formatXml(expected);
  const pass = formattedReceived === formattedExpected;

  return {
    pass,
    actual: formattedReceived,
    expected: formattedExpected,
    message: () =>
      pass ? 'Expected XML structures not to be equal' : 'Expected XML structures to be equal',
  };
};

expect.extend({ toEqualXML });

interface XmlMatchers<R = unknown> {
  toEqualXML: (expected: string) => R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Assertion<R extends void | Promise<void> = void, T = unknown>
    extends XmlMatchers<R> {}

  interface AsymmetricMatchersContaining extends XmlMatchers {}
}
