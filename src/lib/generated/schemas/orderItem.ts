/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * EC Site API
 * OpenAPI spec version: 0.0.0
 */
import type { Product } from './product';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}
