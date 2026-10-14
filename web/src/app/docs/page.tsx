import type { Metadata } from 'next';
import { DocsClient } from './docs-client';

export const metadata: Metadata = {
  title: 'Docs',
  description:
    'Comprehensive documentation for blitzyxsc-plus — every endpoint, every limit, every response shape. By Blitz (blitzlabx).',
};

export default function DocsPage() {
  return <DocsClient />;
}
