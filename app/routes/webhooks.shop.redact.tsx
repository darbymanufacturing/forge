/**
 * GDPR: shop/redact
 * Shopify sends this 48 hours after app uninstall to request deletion of
 * all shop data. Required for public apps.
 */
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop} — deleting all shop data`);

  // Hard-delete all shop data: cascade removes products, configs, designs.
  await db.shop.deleteMany({ where: { domain: shop } });
  // Sessions should already be gone from app/uninstalled, but clean up just in case.
  await db.session.deleteMany({ where: { shop } });

  return new Response();
};
