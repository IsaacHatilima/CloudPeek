import type { ResourceDescriptor } from "@/features/resources/resource-states";

import { ReportScreen } from "./report-screen";
import { usageRows } from "./usage-presenters";

const USAGE: ResourceDescriptor = {
  icon: { ios: "chart.bar", android: "bar_chart", web: "bar_chart" },
  label: "Usage",
};

/** The Usage screen: where this period's spend comes from. */
export function UsageScreen() {
  return (
    <ReportScreen
      descriptor={USAGE}
      detail="The usage report breaks the period's spend down by resources, add-ons, and applications."
      rowsFrom={usageRows}
    />
  );
}
