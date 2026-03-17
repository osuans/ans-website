import { PortableText as PortableTextReact } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

interface Props {
  value: PortableTextBlock[];
}

export default function PortableText({ value }: Props) {
  if (!value || value.length === 0) return null;
  return <PortableTextReact value={value} />;
}
