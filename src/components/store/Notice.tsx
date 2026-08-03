export function Notice({
  kind = 'info', children,
}: { kind?: 'info' | 'warn' | 'err'; children: React.ReactNode }) {
  return <div className={`ar-note ar-note-${kind}`} role={kind === 'err' ? 'alert' : undefined}>{children}</div>;
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="ar-empty">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
