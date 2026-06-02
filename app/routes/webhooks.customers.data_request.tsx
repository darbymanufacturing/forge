/**
 * GDPR: customers/data_request
 * Shopify sends this when a customer requests their data.
 * Required for public apps. Log the request — full data export is Phase N.
 */
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`, {
    customerId: (payload as { customer?: { id?: string } }).customer?.id,
  });

  // TODO (Phase N): export customer-associated Design rows as JSON.
  // For now, acknowledge receipt — no customer PII is stored beyond Shopify IDs.

  return new Response();
};
