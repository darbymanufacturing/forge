/**
 * Type augmentation for Shopify App Home / Polaris web components that are
 * not yet declared in @shopify/polaris-types v1.0.1.
 *
 * Update this file as @shopify/polaris-types matures.
 * See BUGS.md BUG-003 for context.
 */

type HTMLElementProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
>;

declare namespace JSX {
  interface IntrinsicElements {
    // App Home navigation components (not in polaris-types — they're App Bridge)
    "s-app-nav": HTMLElementProps;
    // Resource list components
    "s-resource-list": HTMLElementProps;
    "s-resource-item": HTMLElementProps & {
      id?: string;
      url?: string;
    };
    // App Home specific s-link (navigation context)
    // Note: regular s-link is typed in polaris-types but may miss some attrs.
    // Extend here if needed.
  }
}
