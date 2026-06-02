/**
 * GDPR: customers/redact
 * Shopify sends this when a customer requests deletion of their data.
 * Required for public apps.
 */
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  const typedPayload = payload as {
    customer?: { id?: string };
    orders_to_redact?: string[];
  };

  console.log(`Received ${topic} webhook for ${shop}`, {
    customerId: typedPayload.customer?.id,
  });

  // Delete any Design rows linked to this customer's orders.
  const orderIds = typedPayload.orders_to_redact ?? [];
  if (orderIds.length > 0) {
    await db.design.deleteMany({
      where: {
        shop: { domain: shop },
        shopifyOrderId: { in: orderIds },
      },
    });
  }

  return new Response();
};
