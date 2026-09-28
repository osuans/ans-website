import { PortableText as PortableTextReact } from '@portabletext/react';
import type { PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

interface Props {
  value: PortableTextBlock[];
}

interface TableValue {
  rows?: { _key: string; cells?: string[] }[];
}

const components: PortableTextComponents = {
  types: {
    // First row is rendered as the header
    table: ({ value }: { value: TableValue }) => {
      const [header, ...rows] = value.rows || [];
      if (!header) return null;
      return (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>{header.cells?.map((cell, i) => <th key={i}>{cell}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._key}>{row.cells?.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  },
};

export default function PortableText({ value }: Props) {
  if (!value || value.length === 0) return null;
  return <PortableTextReact value={value} components={components} />;
}
