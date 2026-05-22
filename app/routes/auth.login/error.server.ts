import { LoginErrorType } from "@shopify/shopify-app-react-router/server";

export type LoginErrors = {
  shop?: LoginErrorType;
};

export function loginErrorMessage(loginErrors: LoginErrors) {
  if (loginErrors?.shop === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if (loginErrors?.shop === LoginErrorType.InvalidShop) {
    return { shop: "Your shop domain is invalid" };
  }
  return { shop: undefined as string | undefined };
}
