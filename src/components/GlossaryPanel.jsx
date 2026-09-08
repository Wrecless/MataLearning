import { BookOpen } from 'lucide-react';

export default function GlossaryPanel({ terms }) {
  if (!terms || terms.length === 0) {
    return null;
  }

  return (
    <details className="glossary-panel">
      <summary>
        <BookOpen size={16} />
        <span>Glossary: what do these words mean?</span>
      </summary>
      <dl>
        {terms.map(({ term, definition }) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{definition}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
