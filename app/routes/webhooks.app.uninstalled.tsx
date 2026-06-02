import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Delete sessions so auth fails cleanly on any re-attempt before reinstall.
  // We keep Shop + product data so merchants who reinstall retain their setup.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response();
};
