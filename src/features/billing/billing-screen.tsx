/**
 * The Billing screen. Cloud has no separate billing endpoint: month-to-date
 * spend, credits, and the spending alert are the `summary` of the usage
 * report, so this is the same report as the Usage screen, read differently.
 */
import { ResourceScreen } from "@/features/resources/resource-screen";
import type { ResourceDescriptor } from "@/features/resources/resource-states";
import { ReportScreen } from "@/features/usage/report-screen";
import { billingRows } from "@/features/usage/usage-presenters";

const BILLING: ResourceDescriptor = {
  icon: { ios: "creditcard", android: "credit_card", web: "credit_card" },
  label: "Billing",
};

export function BillingScreen() {
  return (
    <ResourceScreen resourceId="billing">
      <ReportScreen
        descriptor={BILLING}
        detail="Month-to-date spend, credits, and the spending alert are the summary section of the usage report."
        rowsFrom={billingRows}
      />
    </ResourceScreen>
  );
}
