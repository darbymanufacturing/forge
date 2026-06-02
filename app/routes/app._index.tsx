import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { PLAN_LIMITS, type PlanTier } from "../utils/billing.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Find or create the Shop record on first load
  const shop = await db.shop.upsert({
    where: { domain: session.shop },
    create: { domain: session.shop },
    update: {},
    select: {
      plan: true,
      installedAt: true,
      firstProductLiveAt: true,
      _count: {
        select: {
          customizableProducts: true,
        },
      },
    },
  });

  const plan = shop.plan as PlanTier;
  const limits = PLAN_LIMITS[plan];
  const productCount = shop._count.customizableProducts;
  const activated = shop.firstProductLiveAt !== null;

  return {
    plan,
    installedAt: shop.installedAt.toISOString(),
    activated,
    productCount,
    productLimit: limits.products === Infinity ? null : limits.products,
  };
};

export default function Dashboard() {
  const { plan, activated, productCount, productLimit } =
    useLoaderData<typeof loader>();

  return (
    <s-page heading="FORGE Dashboard">
      {!activated && (
        <s-box
          padding="base"
          borderWidth="base"
          borderRadius="base"
          background="subdued"
        >
          <s-stack direction="block" gap="base">
            <s-heading>Get your first product live</s-heading>
            <s-paragraph>
              Connect Printify, pick a product, and define your first design
              zone — you can be live in under 10 minutes.
            </s-paragraph>
            <s-button href="/app/products" variant="primary">
              Add a product
            </s-button>
          </s-stack>
        </s-box>
      )}

      <s-section heading="Your plan">
        <s-stack direction="inline" gap="base">
          <s-badge tone={plan === "FREE" ? "neutral" : "success"}>
            {plan}
          </s-badge>
          {productLimit !== null ? (
            <s-text>
              {productCount} / {productLimit} customizable products
            </s-text>
          ) : (
            <s-text>{productCount} customizable products (unlimited)</s-text>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Quick actions">
        <s-stack direction="inline" gap="base">
          <s-button href="/app/products">Manage products</s-button>
          <s-button href="/app/settings" variant="tertiary">
            Connect Printify
          </s-button>
        </s-stack>
      </s-section>

      {activated && (
        <s-section slot="aside" heading="Activation ✓">
          <s-paragraph>
            First customizable product is live — great work!
          </s-paragraph>
        </s-section>
      )}

      <s-section slot="aside" heading="Performance targets">
        <s-unordered-list>
          <s-list-item>Bundle &lt; 150 KB gzipped</s-list-item>
          <s-list-item>LCP &lt; 2.5 s on mobile</s-list-item>
          <s-list-item>Preview latency &lt; 300 ms (p95)</s-list-item>
          <s-list-item>No per-order fees — ever</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
