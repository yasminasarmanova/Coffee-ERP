export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">

      <aside className="sidebar">
        <div className="logo">Coffee ERP</div>

        <div className="item">Inventory</div>
        <div className="item">Logistics</div>
        <div className="item">Analytics</div>
      </aside>

      <main className="main">
        {children}
      </main>

    </div>
  );
}