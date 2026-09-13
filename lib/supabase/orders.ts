import { createServiceClient } from "./service";
import { sendNewOrderNotification } from "lib/email";
import type { OrderStatus, PaymentStatus } from "lib/order-status";

export type { OrderStatus, PaymentStatus } from "lib/order-status";

export interface CreateOrderData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    variant_name?: string;
  }>;
  total_price: number;
  products_subtotal?: number;
  payment_method: "cash_on_delivery" | "card" | "bank_transfer";
  comment?: string;
  idempotency_key?: string;
  shipping_method?: "office" | "apt" | "address";
  shipping_price?: number;
  shipping_site_id?: number;
  shipping_site_name?: string;
  shipping_office_id?: number;
  shipping_office_name?: string;
  shipping_deadline?: string;
  shipping_details?: Record<string, unknown>;
}

function initialStatuses(paymentMethod: CreateOrderData["payment_method"]): {
  status: OrderStatus;
  payment_status: PaymentStatus;
} {
  if (paymentMethod === "card") {
    return { status: "new", payment_status: "awaiting_payment" };
  }
  // Keep "new" until an admin moves the order — dashboard "Нови поръчки" counts status=new.
  return { status: "new", payment_status: "cash_on_delivery" };
}

/**
 * Create a new order. Returns existing order if idempotency_key matches.
 */
export async function createOrder(data: CreateOrderData) {
  const supabase = createServiceClient();

  if (data.idempotency_key) {
    const { data: existing } = await supabase
      .from("orders")
      .select("*")
      .eq("idempotency_key", data.idempotency_key)
      .maybeSingle();

    if (existing) {
      return existing;
    }
  }

  const productsJson = data.products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    ...(product.variant_name ? { variant_name: product.variant_name } : {}),
  }));

  const { status, payment_status } = initialStatuses(data.payment_method);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone || null,
      customer_address: data.customer_address,
      products: productsJson,
      total_price: data.total_price,
      products_subtotal: data.products_subtotal ?? null,
      payment_method: data.payment_method,
      payment_status,
      status,
      comment: data.comment || null,
      idempotency_key: data.idempotency_key || null,
      shipping_method: data.shipping_method || null,
      shipping_price: data.shipping_price ?? 0,
      shipping_site_id: data.shipping_site_id ?? null,
      shipping_site_name: data.shipping_site_name || null,
      shipping_office_id: data.shipping_office_id ?? null,
      shipping_office_name: data.shipping_office_name || null,
      shipping_deadline: data.shipping_deadline || null,
      shipping_details: data.shipping_details || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505" && data.idempotency_key) {
      const { data: existing } = await supabase
        .from("orders")
        .select("*")
        .eq("idempotency_key", data.idempotency_key)
        .single();
      if (existing) return existing;
    }
    console.error("Error creating order:", error);
    const details = [error.message, error.code, error.details, error.hint]
      .filter(Boolean)
      .join(" | ");
    if (
      details.includes("payment_status") ||
      details.includes("orders_status_check") ||
      details.includes("orders_payment_status")
    ) {
      throw new Error(
        `Базата данни не е обновена за новите статуси. Изпълнете next_migration.sql в Supabase. (${details})`,
      );
    }
    throw new Error(
      `Грешка при записване на поръчката: ${details || "unknown db error"}`,
    );
  }

  if (!order) {
    throw new Error("Failed to create order");
  }

  return order;
}

export async function getOrderById(orderId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !data) {
    throw new Error("Order not found");
  }

  return data;
}

export async function getOrderByStripeSessionId(sessionId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to fetch order");
  }

  return data;
}

export async function updateOrderStripeSession(
  orderId: string,
  stripeSessionId: string,
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      stripe_session_id: stripeSessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Тази поръчка вече има активна сесия за плащане");
    }
    throw new Error("Failed to update order with Stripe session");
  }

  return data;
}

async function sendOrderNotificationOnce(order: Record<string, unknown>) {
  const supabase = createServiceClient();

  if (order.email_sent_at) {
    return;
  }

  const result = await sendNewOrderNotification({
    orderId: String(order.id),
    customerName: String(order.customer_name),
    customerEmail: String(order.customer_email),
    customerPhone: order.customer_phone
      ? String(order.customer_phone)
      : undefined,
    customerAddress: String(order.customer_address),
    totalPrice: Number(order.total_price),
    productsSubtotal:
      order.products_subtotal != null
        ? Number(order.products_subtotal)
        : undefined,
    shippingPrice:
      order.shipping_price != null ? Number(order.shipping_price) : undefined,
    paymentMethod: order.payment_method as
      | "cash_on_delivery"
      | "card"
      | "bank_transfer",
    products: (order.products as any[]).map((p: any) => ({
      id: p.id,
      name: p.variant_name ? `${p.name} (${p.variant_name})` : p.name,
      price: Number(p.price),
      quantity: p.quantity,
    })),
    comment: order.comment ? String(order.comment) : undefined,
  });

  if (!result.success) {
    console.warn(
      "Order email skipped/failed (order still accepted):",
      result.error,
    );
  }

  await supabase
    .from("orders")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", order.id);
}

/**
 * Stripe payment confirmed — mark paid and move order to fulfillment queue.
 */
export async function fulfillPaidOrder(orderId: string) {
  const supabase = createServiceClient();
  const order = await getOrderById(orderId);

  if (order.payment_status === "paid" && order.status === "processing") {
    if (!order.email_sent_at) {
      await sendOrderNotificationOnce(order);
    }
    return order;
  }

  if (order.status === "canceled") {
    return order;
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: order.status === "new" ? "processing" : order.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !updated) {
    throw new Error("Failed to update order status");
  }

  await sendOrderNotificationOnce(updated);
  return updated;
}

/**
 * Mark card payment as failed — order stays at "Нова".
 */
export async function markPaymentFailed(orderId: string) {
  const supabase = createServiceClient();
  const order = await getOrderById(orderId);

  if (order.payment_status === "paid") {
    return order;
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      payment_status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !updated) {
    throw new Error("Failed to update payment status");
  }

  return updated;
}

/**
 * COD / bank transfer — notify admin. Leave fulfillment status as "new"
 * so it appears under "Нови поръчки" until an admin changes it.
 */
export async function fulfillCodOrder(orderId: string) {
  const order = await getOrderById(orderId);

  let current = order;

  if (
    order.payment_method !== "card" &&
    order.payment_status !== "cash_on_delivery"
  ) {
    const supabase = createServiceClient();
    const { data: updated } = await supabase
      .from("orders")
      .update({
        payment_status: "cash_on_delivery",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();
    if (updated) current = updated;
  }

  await sendOrderNotificationOnce(current);
  return current;
}

export async function getAllOrders() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch orders");
  }

  return data || [];
}

export type OrdersQuery = {
  paymentStatus?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
};

const ORDER_STATUS_RANK: Record<string, number> = {
  new: 0,
  pending_payment: 0,
  processing: 1,
  confirmed: 1,
  paid: 1,
  shipped: 2,
  delivered: 3,
  completed: 3,
  canceled: 4,
};

const PAYMENT_STATUS_RANK: Record<string, number> = {
  cash_on_delivery: 0,
  awaiting_payment: 1,
  paid: 2,
  failed: 3,
};

function endOfDayIso(dateYmd: string): string {
  // Inclusive end of local calendar day → UTC ISO for DB compare
  const d = new Date(`${dateYmd}T23:59:59.999`);
  return d.toISOString();
}

function startOfDayIso(dateYmd: string): string {
  const d = new Date(`${dateYmd}T00:00:00.000`);
  return d.toISOString();
}

export async function getOrdersFiltered(query: OrdersQuery = {}) {
  const supabase = createServiceClient();

  let q = supabase.from("orders").select("*");

  if (
    query.paymentStatus &&
    ["cash_on_delivery", "awaiting_payment", "paid", "failed"].includes(
      query.paymentStatus,
    )
  ) {
    q = q.eq("payment_status", query.paymentStatus);
  }

  if (
    query.status &&
    ["new", "processing", "shipped", "delivered", "canceled"].includes(
      query.status,
    )
  ) {
    q = q.eq("status", query.status);
  }

  if (query.from && /^\d{4}-\d{2}-\d{2}$/.test(query.from)) {
    q = q.gte("created_at", startOfDayIso(query.from));
  }

  if (query.to && /^\d{4}-\d{2}-\d{2}$/.test(query.to)) {
    q = q.lte("created_at", endOfDayIso(query.to));
  }

  const sort = query.sort || "date_desc";

  if (sort === "date_asc") {
    q = q.order("created_at", { ascending: true });
  } else if (sort === "date_desc") {
    q = q.order("created_at", { ascending: false });
  } else {
    // Status sorts applied in memory after fetch (custom rank)
    q = q.order("created_at", { ascending: false });
  }

  const { data, error } = await q;

  if (error) {
    throw new Error("Failed to fetch orders");
  }

  const orders = data || [];

  if (sort === "payment_status_asc" || sort === "payment_status_desc") {
    const dir = sort.endsWith("_asc") ? 1 : -1;
    return [...orders].sort((a, b) => {
      const ra = PAYMENT_STATUS_RANK[a.payment_status] ?? 99;
      const rb = PAYMENT_STATUS_RANK[b.payment_status] ?? 99;
      if (ra !== rb) return (ra - rb) * dir;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }

  if (sort === "status_asc" || sort === "status_desc") {
    const dir = sort.endsWith("_asc") ? 1 : -1;
    return [...orders].sort((a, b) => {
      const ra = ORDER_STATUS_RANK[a.status] ?? 99;
      const rb = ORDER_STATUS_RANK[b.status] ?? 99;
      if (ra !== rb) return (ra - rb) * dir;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }

  return orders;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !data) {
    throw new Error("Failed to update order status");
  }

  return data;
}

export interface UpdateOrderData {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  total_price?: number;
  payment_method?: "cash_on_delivery" | "card" | "bank_transfer";
  status?: OrderStatus;
  comment?: string;
  created_at?: string;
}

export async function updateOrder(orderId: string, data: UpdateOrderData) {
  const supabase = createServiceClient();

  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: order, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select()
    .single();

  if (error || !order) {
    throw new Error("Failed to update order");
  }

  return order;
}

export async function saveSpeedyShipment(
  orderId: string,
  data: {
    speedy_shipment_id: string;
    speedy_parcel_id: string;
  },
) {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data: order, error } = await supabase
    .from("orders")
    .update({
      speedy_shipment_id: data.speedy_shipment_id,
      speedy_parcel_id: data.speedy_parcel_id,
      speedy_created_at: now,
      updated_at: now,
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !order) {
    throw new Error("Failed to save Speedy shipment");
  }

  return order;
}

export async function getOrdersForSpeedySync() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .not("speedy_parcel_id", "is", null)
    .in("status", ["processing", "shipped"])
    .order("speedy_last_synced_at", { ascending: true, nullsFirst: true })
    .limit(50);

  if (error) {
    throw new Error("Failed to fetch orders for Speedy sync");
  }

  return data || [];
}

export async function updateOrderFromSpeedyTrack(
  orderId: string,
  updates: {
    status?: OrderStatus;
    speedy_last_synced_at?: string;
  },
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !data) {
    throw new Error("Failed to update order from Speedy track");
  }

  return data;
}

/** Orders that count toward revenue (card paid, or COD collected on delivery). */
export function isPaidRevenueOrder(order: {
  status: string;
  payment_status: string;
}): boolean {
  if (order.status === "canceled") return false;
  if (order.payment_status === "paid") return true;
  if (
    order.payment_status === "cash_on_delivery" &&
    order.status === "delivered"
  ) {
    return true;
  }
  return false;
}

export async function deleteOrders(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;

  const supabase = createServiceClient();
  const uniqueIds = [...new Set(ids.filter(Boolean))];

  const { error, count } = await supabase
    .from("orders")
    .delete({ count: "exact" })
    .in("id", uniqueIds);

  if (error) {
    throw new Error("Failed to delete orders");
  }

  return count ?? uniqueIds.length;
}
