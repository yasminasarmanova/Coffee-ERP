import type { Product } from "../types";
import { FaEdit, FaTrash } from "react-icons/fa";

type Props = {
  products: Product[];
  onDelete: (id: number) => void;
  onEdit: (product: Product) => void;
};

export default function ProductList({ products, onDelete, onEdit }: Props) {
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
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => {
            const isDelivered = p.delivery_status === "Delivered";
            const isOverdue = p.transport_time < 0;

            const statusText = isDelivered
              ? "Delivered"
              : isOverdue
              ? "Delayed"
              : "In Transit";

            const transportText = isDelivered
              ? "Delivered"
              : isOverdue
              ? "Overdue"
              : `${p.transport_time} days`;

            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.origin}</td>
                <td>{p.quantity}</td>
                <td>{p.supplier}</td>

                <td style={{ color: isOverdue ? "#ff4d4d" : "inherit" }}>
                  {transportText}
                </td>

                <td>
                  <span
                    className={
                      isDelivered
                        ? "status delivered"
                        : isOverdue
                        ? "status overdue"
                        : "status transit"
                    }
                  >
                    {statusText}
                  </span>
                </td>

                <td>
                  <button onClick={() => onEdit(p)} style={{ marginRight: "8px" }}>
                    <FaEdit />
                  </button>
                  <button onClick={() => onDelete(p.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}