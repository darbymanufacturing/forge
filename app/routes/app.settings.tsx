import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { type PlanTier } from "../utils/billing.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await db.shop.findUnique({
    where: { domain: session.shop },
    select: {
      plan: true,
      printifyShopId: true,
    },
  });

  return {
    plan: (shop?.plan ?? "FREE") as PlanTier,
    printifyConnected: Boolean(shop?.printifyShopId),
  };
};

export default function SettingsPage() {
  const { plan, printifyConnected } = useLoaderData<typeof loader>();

  const planDescription = {
    FREE: "Free tier: 5 products, 50 designs / month. No transaction fees.",
    STARTER: "Starter: 25 products, 500 designs / month. No transaction fees.",
    GROWTH: "Growth: unlimited products, 3,000 designs / month. No transaction fees.",
    SCALE: "Scale: unlimited everything. No transaction fees.",
  }[plan];

  return (
    <s-page heading="Settings">
      <s-section heading="Printify connection">
        {printifyConnected ? (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="base">
              <s-heading>Printify connected</s-heading>
              <s-paragraph>
                Your Printify account is linked. Products and orders will sync
                automatically.
              </s-paragraph>
            </s-stack>
          </s-box>
        ) : (
          <s-stack direction="block" gap="base">
            <s-paragraph>
              Connect your Printify account to import products and fulfil orders
              automatically.
            </s-paragraph>
            <s-text-field
              label="Printify API token"
            />
            <s-button variant="primary">Connect Printify</s-button>
          </s-stack>
        )}
      </s-section>

      <s-section heading="Plan" slot="aside">
        <s-stack direction="block" gap="base">
          <s-badge tone={plan === "FREE" ? "neutral" : "success"}>
            {plan}
          </s-badge>
          <s-text>{planDescription}</s-text>
          {plan === "FREE" && (
            <s-button variant="tertiary">Upgrade plan</s-button>
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
