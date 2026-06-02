/**
 * FORGE Customizer — storefront web component
 *
 * Performance budget (non-negotiable gates):
 *   • JS bundle < 150 KB gzipped
 *   • LCP     < 2.5 s on mobile
 *   • Preview update latency < 300 ms at p95
 *
 * This file is the entry point bundled by esbuild into
 * extensions/customizer/assets/forge-customizer.js
 *
 * Phase 1 (foundation): ships a self-contained custom element that
 * mounts, reads its attributes, and renders a placeholder UI.
 * Phase 3 will fill in the real 2D preview + design-zone logic.
 */

interface DesignArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  allowText: boolean;
  allowImage: boolean;
}

interface CustomizerConfig {
  designAreas: DesignArea[];
  baseImageUrl?: string;
  allowedFonts?: string[];
  allowedColors?: string[];
}

class ForgeCustomizer extends HTMLElement {
  private config: CustomizerConfig | null = null;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    const productId = this.getAttribute("product-id");
    const shop = this.getAttribute("shop");

    if (!productId || !shop) {
      this.renderError("Missing product-id or shop attribute.");
      return;
    }

    this.loadConfig(productId, shop);
  }

  private async loadConfig(productId: string, shop: string): Promise<void> {
    try {
      this.renderLoading();

      // Phase 3 will replace this placeholder with a real API call.
      // The endpoint will return the CustomizerConfig JSON for this product.
      const url = `/apps/forge/customizer-config?shop=${encodeURIComponent(shop)}&productId=${encodeURIComponent(productId)}`;

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        // Product has no customizer configured — render nothing.
        this.shadow.innerHTML = "";
        return;
      }

      this.config = (await res.json()) as CustomizerConfig;
      this.render();
    } catch (err) {
      // Fail silently on the storefront — never break the product page.
      console.error("[FORGE] Failed to load customizer config:", err);
      this.shadow.innerHTML = "";
    }
  }

  private render(): void {
    if (!this.config) return;

    // Phase 3 will replace this with the full 2D canvas customizer.
    // Foundation render: confirm the component mounts and config loads.
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
          box-sizing: border-box;
        }
        .forge-wrapper {
          border: 1px solid #e1e3e5;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
        .forge-title {
          font-size: 14px;
          font-weight: 600;
          color: #202223;
          margin: 0 0 8px;
        }
        .forge-placeholder {
          background: #f6f6f7;
          border-radius: 6px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6d7175;
          font-size: 13px;
        }
      </style>
      <div class="forge-wrapper">
        <p class="forge-title">Personalise this product</p>
        <div class="forge-placeholder">
          <!-- Phase 3: 2D canvas customizer renders here -->
          Customizer coming soon
        </div>
      </div>
    `;
  }

  private renderLoading(): void {
    this.shadow.innerHTML = `
      <style>
        :host { display: block; }
        .forge-loading {
          height: 200px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: forge-shimmer 1.2s infinite;
          border-radius: 8px;
          margin: 16px 0;
        }
        @keyframes forge-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      </style>
      <div class="forge-loading" aria-label="Loading customizer…" role="status"></div>
    `;
  }

  private renderError(message: string): void {
    // Only shown in development — production silently removes the element.
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "development"
    ) {
      this.shadow.innerHTML = `<p style="color:red;font-size:12px">[FORGE] ${message}</p>`;
    } else {
      this.shadow.innerHTML = "";
    }
  }
}

// Register the custom element
if (!customElements.get("forge-customizer")) {
  customElements.define("forge-customizer", ForgeCustomizer);
}
