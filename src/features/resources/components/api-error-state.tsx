import { describeApiError, isAuthenticationError } from "@/services/cloud-api/errors";
import type { ColorPalette } from "@/theme/types";

import { StateMessage } from "./state-message";

export function ApiErrorState({ colors, error, onConnect, onRetry, title }: {
  colors: ColorPalette;
  error: unknown;
  onConnect?: () => void;
  onRetry: () => void;
  title: string;
}) {
  const reconnect = isAuthenticationError(error) && onConnect;
  return <StateMessage colors={colors} body={describeApiError(error)}
    title={reconnect ? "Reconnect your organization" : title}
    icon={reconnect ? { ios: "key.horizontal", android: "key", web: "key" } : { ios: "exclamationmark.triangle", android: "warning", web: "warning" }}
    action={{ label: reconnect ? "Reconnect organization" : "Try again", onPress: reconnect || onRetry }} />;
}
