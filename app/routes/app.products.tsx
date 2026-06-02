import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { isWithinProductQuota, type PlanTier } from "../utils/billing.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await db.shop.findUnique({
    where: { domain: session.shop },
    include: {
      customizableProducts: {
        include: { config: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const products = shop?.customizableProducts ?? [];
  const plan = (shop?.plan ?? "FREE") as PlanTier;
  const canAddMore = isWithinProductQuota(plan, products.length);

  return {
    products: products.map((p) => ({
      id: p.id,
      shopifyProductId: p.shopifyProductId,
      status: p.status,
      hasConfig: p.config !== null,
    })),
    canAddMore,
  };
};

export default function ProductsPage() {
  const { products, canAddMore } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Customizable Products">
      {canAddMore && (
        <s-button slot="primary-action" variant="primary">
          Add product
        </s-button>
      )}

      {!canAddMore && (
        <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
          <s-stack direction="block" gap="base">
            <s-heading>Product limit reached</s-heading>
            <s-paragraph>
              Upgrade your plan to add more customizable products.
            </s-paragraph>
            <s-button href="/app/settings" variant="tertiary">
              Upgrade plan
            </s-button>
          </s-stack>
        </s-box>
      )}

      {products.length === 0 ? (
        <s-section heading="No products yet">
          <s-paragraph>
            Add your first customizable product. Customers will be able to
            personalise it directly on your storefront — no app redirect needed.
          </s-paragraph>
        </s-section>
      ) : (
        <s-section heading="Your products">
          <s-resource-list>
            {products.map((product) => (
              <s-resource-item
                key={product.id}
                id={product.id}
                url={`/app/products/${product.id}`}
              >
                <s-stack direction="inline" gap="base">
                  <s-text>{product.shopifyProductId}</s-text>
                  <s-badge
                    tone={product.status === "LIVE" ? "success" : "neutral"}
                  >
                    {product.status}
                  </s-badge>
                  {product.hasConfig ? (
                    <s-badge tone="info">Config ready</s-badge>
                  ) : (
                    <s-badge tone="warning">Needs setup</s-badge>
                  )}
                </s-stack>
              </s-resource-item>
            ))}
          </s-resource-list>
        </s-section>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
