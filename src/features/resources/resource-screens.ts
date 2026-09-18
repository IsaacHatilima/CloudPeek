import type { ComponentType } from "react";

import { ApplicationsScreen } from "@/features/applications/applications-screen";
import { BackgroundProcessesScreen } from "@/features/background-processes/background-processes-screen";
import { BillingScreen } from "@/features/billing/billing-screen";
import { BucketKeysScreen } from "@/features/bucket-keys/bucket-keys-screen";
import { CachesScreen } from "@/features/caches/caches-screen";
import { CommandsScreen } from "@/features/commands/commands-screen";
import { DatabaseClustersScreen } from "@/features/database-clusters/database-clusters-screen";
import { DatabaseRestoresScreen } from "@/features/database-restores/database-restores-screen";
import { DatabaseSnapshotsScreen } from "@/features/database-snapshots/database-snapshots-screen";
import { DatabasesScreen } from "@/features/databases/databases-screen";
import { DedicatedClustersScreen } from "@/features/dedicated-clusters/dedicated-clusters-screen";
import { DeploymentsScreen } from "@/features/deployments/deployments-screen";
import { DomainsScreen } from "@/features/domains/domains-screen";
import { EdgeNetworksScreen } from "@/features/edge-networks/edge-networks-screen";
import { EnvironmentLogsScreen } from "@/features/environment-logs/environment-logs-screen";
import { EnvironmentsScreen } from "@/features/environments/environments-screen";
import { InstancesScreen } from "@/features/instances/instances-screen";
import { ObjectStorageBucketsScreen } from "@/features/object-storage-buckets/object-storage-buckets-screen";
import { OrganizationScreen } from "@/features/organization/organization-screen";
import { RegionsScreen } from "@/features/regions/regions-screen";
import { SecretsScreen } from "@/features/secrets/secrets-screen";
import { UsageScreen } from "@/features/usage/usage-screen";
import { WebSocketApplicationsScreen } from "@/features/websocket-applications/websocket-applications-screen";
import { WebSocketClustersScreen } from "@/features/websocket-clusters/websocket-clusters-screen";
import type { ResourceId } from "@/features/cloud-resources/types";

import type { ResourceFeatureProps } from "./resource-screen";

/** Every side-menu resource has an explicit feature entry point. */
export const RESOURCE_SCREENS: Record<ResourceId, ComponentType<ResourceFeatureProps>> = {
  "applications": ApplicationsScreen,
  "background-processes": BackgroundProcessesScreen,
  "billing": BillingScreen,
  "bucket-keys": BucketKeysScreen,
  "caches": CachesScreen,
  "commands": CommandsScreen,
  "database-clusters": DatabaseClustersScreen,
  "database-restores": DatabaseRestoresScreen,
  "database-snapshots": DatabaseSnapshotsScreen,
  "databases": DatabasesScreen,
  "dedicated-clusters": DedicatedClustersScreen,
  "deployments": DeploymentsScreen,
  "domains": DomainsScreen,
  "edge-networks": EdgeNetworksScreen,
  "environment-logs": EnvironmentLogsScreen,
  "environments": EnvironmentsScreen,
  "instances": InstancesScreen,
  "object-storage-buckets": ObjectStorageBucketsScreen,
  "organization": OrganizationScreen,
  "regions": RegionsScreen,
  "secrets": SecretsScreen,
  "usage": UsageScreen,
  "websocket-applications": WebSocketApplicationsScreen,
  "websocket-clusters": WebSocketClustersScreen,
};
