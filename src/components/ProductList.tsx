import type { Product } from "../types";
import { FaEdit, FaTrash } from "react-icons/fa";

type Props = {
  products: Product[];
  onDelete: (id: number) => void;
  onEdit: (product: Product) => void;
};

export default function ProductList({
  products,
  onDelete,
  onEdit,
}: Props) {
  return (
    <div>
      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Origin</th>
            <th>Quantity</th>
            <th>Supplier</th>
            <th>Transport Time</th>
            <th>Delivery Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.origin}</td>
              <td>{p.quantity}</td>
              <td>{p.supplier}</td>
              
             <td style={{ 
              color: p.transport_time < 0 ? "#ff4d4d" : "inherit", 
              fontWeight: p.transport_time < 0 ? "600" : "normal" 
            } }>
            {p.delivery_status === "Delivered" 
             ? "Delivered" 
            : p.transport_time < 0 
            ? "Overdue" 
            : `${p.transport_time} days`
             }
</td>

<td>
  <span className={
    p.delivery_status === "Delivered" 
      ? "status delivered" 
      : p.transport_time < 0 
        ? "status overdue" 
        : "status transit"
  }>
    {p.delivery_status === "Delivered" 
      ? "Delivered" 
      : p.transport_time < 0 
        ? "Delayed" 
        : "In Transit"}
  </span>
</td>

              <td>
                <button onClick={() => onEdit(p)} style={{ marginRight: "8px", cursor: "pointer" }}>
                  <FaEdit />
                </button>
                <button onClick={() => onDelete(p.id)} style={{ cursor: "pointer" }}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}