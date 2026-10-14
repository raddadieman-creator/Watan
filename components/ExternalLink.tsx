/** رابط خارجي يفتح في نافذة جديدة، مع ترميز الروابط العربية */
export function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={encodeURI(decodeURI(href))} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (يفتح في نافذة جديدة)</span>
    </a>
  );
}
