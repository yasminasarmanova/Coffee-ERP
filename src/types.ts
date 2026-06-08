export interface Product {
  id: number;
  name: string;
  origin: string;
  quantity: number;
  supplier: string;
  transport_time: number;
  delivery_status: "In Transit" | "Delivered";
}