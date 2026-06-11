import { useEffect, useState } from "react";
import ProductList from "./components/ProductList";
import Analytics from "./components/Analytics"; 
import Logistics from "./components/Logistics";
import Auth from "./components/Auth"; 
import type { Product } from "./types";
import { supabase } from "./supabaseClient";

function App() {
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentTab, setCurrentTab] = useState<"inventory" | "logistics" | "analytics">("inventory");

  const [form, setForm] = useState({
    name: "",
    origin: "",
    quantity: "",
    supplier: "",
    transportTime: "",
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<string>("none");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      setCurrentTab("inventory");
    }
  }, [session]);

const totalProducts = totalCount;
  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStock = products.filter((p) => p.quantity < 10).length;

  const averageTransport =
    products.length > 0
      ? Math.round(
          products.reduce((sum, p) => sum + p.transport_time, 0) /
            products.length
        )
      : 0;
const totalPages = Math.ceil(totalCount / pageSize);
const fetchProducts = async () => {
  if (!session?.user?.id) return;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(
      `
      id,
      name,
      origin,
      quantity,
      supplier,
      transport_time,
      delivery_status
      `,
      { count: "exact" }
    )
    .eq("user_id", session.user.id);

  // Server-side filtering
  if (searchQuery.trim()) {
    query = query.or(
      `name.ilike.%${searchQuery}%,
       origin.ilike.%${searchQuery}%,
       supplier.ilike.%${searchQuery}%`
    );
  }

  // Sorting
  if (sortBy === "quantity") {
    query = query.order("quantity", { ascending: false });
  } else if (sortBy === "name") {
    query = query.order("name", { ascending: true });
  }

  // Pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    return;
  }
setProducts(data || []);
setTotalCount(count || 0);
};

useEffect(() => {
  if (session) {
    fetchProducts();
  }
}, [sortBy, session, currentTab, page, searchQuery]);

  const resetForm = () => {
    setForm({ name: "", origin: "", quantity: "", supplier: "", transportTime: "" });
    setEditId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const addProduct = async () => {
  if (!session?.user?.id) return;

  const quantity = Number(form.quantity);
  const transportTime = Number(form.transportTime);

  if (!form.name.trim()) {
    alert("Product name is required.");
    return;
  }

  if (!form.origin.trim()) {
    alert("Origin is required.");
    return;
  }

  if (!form.supplier.trim()) {
    alert("Supplier is required.");
    return;
  }

  if (isNaN(quantity) || quantity < 0) {
    alert("Quantity must be a valid positive number.");
    return;
  }

  if (isNaN(transportTime) || transportTime < 0) {
    alert("Transport time cannot be negative.");
    return;
  }

  await supabase.from("products").insert([
    {
      name: form.name,
      origin: form.origin,
      quantity,
      supplier: form.supplier,
      transport_time: transportTime,
      user_id: session.user.id,
      delivery_status: transportTime > 0 ? "In Transit" : "Delivered",
    },
  ]);

  resetForm();
  setShowModal(false);
  fetchProducts();
};

  const deleteProduct = async (id: number) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const editProduct = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      origin: product.origin,
      quantity: String(product.quantity),
      supplier: product.supplier,
      transportTime: String(product.transport_time),
    });
    setShowModal(true);
  };

const updateProduct = async () => {
  if (!editId || !session?.user?.id) return;

  const quantity = Number(form.quantity);
  const transportVal = Number(form.transportTime);

  if (!form.name.trim()) {
    alert("Product name is required.");
    return;
  }

  if (quantity < 0 || isNaN(quantity)) {
    alert("Quantity must be a valid positive number.");
    return;
  }

  if (transportVal < 0 || isNaN(transportVal)) {
    alert("Transport time cannot be negative.");
    return;
  }

  await supabase
    .from("products")
    .update({
      name: form.name,
      origin: form.origin,
      quantity,
      supplier: form.supplier,
      transport_time: transportVal,
      delivery_status: transportVal > 0 ? "In Transit" : "Delivered",
      user_id: session.user.id,
    })
    .eq("id", editId)
    .eq("user_id", session.user.id);

  resetForm();
  setShowModal(false);
  fetchProducts();
};

  const handleUpdateProductFields = async (id: number, updates: Partial<Product>) => {
    if (!session?.user?.id) return;

    await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .eq("user_id", session.user.id);

    fetchProducts();
  };

  const handleCancel = () => {
    resetForm();
    setShowModal(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProducts([]);
  };

  if (!session) {
    return <Auth />;
  }
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = Math.max(0, Number(e.target.value));
  setForm({ ...form, quantity: String(value) });

};
  const handleTransportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = Math.max(0, Number(e.target.value));
  setForm({ ...form, transportTime: String(value) });
};
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">COFFEE ERP</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", height: "calc(100% - 60px)" }}>
          <div 
            className={`item ${currentTab === "inventory" ? "active" : ""}`} 
            onClick={() => setCurrentTab("inventory")}
          >
            Inventory
          </div>
          
          <div 
            className={`item ${currentTab === "logistics" ? "active" : ""}`} 
            onClick={() => setCurrentTab("logistics")}
          >
            Logistics
          </div>
          
          <div 
            className={`item ${currentTab === "analytics" ? "active" : ""}`} 
            onClick={() => setCurrentTab("analytics")}
          >
            Analytics
          </div>
          
          <div 
            className="item logout-btn" 
            style={{ 
              marginTop: "auto", 
              color: "#ff4d4d", 
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.2s ease"
            }} 
            onClick={handleLogout}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 77, 77, 0.08)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </div>
        </nav>
      </aside>

      <main className="main">
        {currentTab === "inventory" && (
          <div className="page">
            <div className="page-header">
              {showModal && (
                <div className="modal-overlay" onClick={handleCancel}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h3>{editId ? "Edit Ingredient" : "Add New Ingredient"}</h3>
                    <input type="text" name="name" placeholder="Coffee Name" value={form.name} onChange={handleChange} />
                    <input type="text" name="origin" placeholder="Origin" value={form.origin} onChange={handleChange} />
                    <input type="number" name="quantity" min="0" placeholder="Quantity" value={form.quantity} onChange={handleQuantityChange} />
                    <input type="text" name="supplier" placeholder="Supplier" value={form.supplier} onChange={handleChange} />
                    <input type="number" name="transportTime" min="0" placeholder="Transport Days" value={form.transportTime} onChange={handleTransportChange} />
                    <div className="modal-actions">
                      <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                      <button className="save-btn" onClick={editId ? updateProduct : addProduct}>
                        {editId ? "Update" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <h2>Inventory Management</h2>
              <button className="add-btn" onClick={() => setShowModal(true)}>+ Add New Ingredient</button>
            </div>

            <div className="stats">
              <div className="card"><h3>Total Products</h3><p>{totalProducts}</p></div>
              <div className="card"><h3>Total Stock</h3><p>{totalStock}</p></div>
              <div className="card"><h3>Low Stock</h3><p>{lowStock}</p></div>
              <div className="card"><h3>Avg Transport</h3><p>{averageTransport} days</p></div>
            </div>

            <div className="table-toolbar" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="toolbar-title" style={{ margin: 0 }}>Stock List</h3>
              <div className="toolbar-actions-right" style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                <div className="search-group">
                  <input className="search-input" placeholder="Search ingredient..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="none">Sort</option>
                  <option value="quantity">Quantity</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
<div className="inventory-wrapper">
  {products.length === 0 ? (
    <div className="no-results">
      <p>No ingredients found matching your search.</p>
    </div>
  ) : (
    <ProductList
      products={products}
      onDelete={deleteProduct}
      onEdit={editProduct}
    />
  )}
</div>
          </div>
        )}

        {currentTab === "logistics" && (
          <Logistics products={products} onUpdateProduct={handleUpdateProductFields} />
        )}

        {currentTab === "analytics" && (
          <Analytics products={products} />
        )}
       <div style={{ marginTop: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
  <button
    className="bt"
    disabled={page === 1}
    onClick={() => setPage((p) => p - 1)}
  >
    Prev
  </button>

  <span className="pg">
    Page {page} of {totalPages || 1}
  </span>

  <button
    className="bt"
    disabled={page >= totalPages}
    onClick={() => setPage((p) => p + 1)}
  >
    Next
  </button>
</div>
      </main>
    </div>
  );
}

export default App;