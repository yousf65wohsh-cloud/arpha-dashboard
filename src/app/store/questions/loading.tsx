// يظهر فوراً عند الانتقال، فلا يرى المستخدم فراغاً بين نقرة وأخرى.
export default function Loading() {
  return (
    <div className="ar-shell">
      <div style={{ height: 58 }} />
      <div className="ar-skel ar-skel-title" />
      <div className="ar-card">
        <div className="ar-skel ar-skel-line" style={{ width: '68%' }} />
        <div className="ar-skel ar-skel-line" style={{ width: '84%' }} />
        <div className="ar-skel ar-skel-line" style={{ width: '52%' }} />
      </div>
      <div className="ar-card">
        <div className="ar-skel ar-skel-line" style={{ width: '76%' }} />
        <div className="ar-skel ar-skel-line" style={{ width: '60%' }} />
      </div>
    </div>
  );
}
