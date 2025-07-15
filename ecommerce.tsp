import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;

@service(#{ title: "EC Site API" })
@server("https://api.example.com", "Production server")
namespace ECommerceAPI;

@error
model ErrorResponse {
  code: int32;
  message: string;
}

model User {
  id: string;
  username: string;
  email: string;
  createdAt: utcDateTime;
}

model Product {
  id: string;
  name: string;
  price: decimal;
  description: string;
  stock: int32;
}

model Order {
  id: string;
  userId: string;
  totalAmount: decimal;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: utcDateTime;
}

model OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: int32;
  price: decimal;
  product: Product;
}

@route("/users")
namespace Users {
  @get
  op getUser(@path username: string): User | ErrorResponse;
}

@route("/orders")
namespace Orders {
  @get
  op getOrdersByUserId(@query userId: string): Order[] | ErrorResponse;

  @route("/{orderId}/items")
  @get
  op getOrderItems(@path orderId: string): OrderItem[] | ErrorResponse;
}

