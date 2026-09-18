import { useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import type { ResourceMenuItem } from "@/features/cloud-resources/types";
import { InlineNotice } from "@/components/inline-notice";
import type { ColorPalette } from "@/theme/types";

import type { RowModel } from "../../presenters";
import { attributeRows, childLinks } from "../detail-model";
import { useChildNavigation } from "../use-child-navigation";
import { useDetailActions } from "../use-detail-actions";
import { ActionRows } from "./action-rows";
import { AttributeRows } from "./attribute-rows";
import { ChildRows } from "./child-rows";
import { DetailHeader } from "./detail-header";

type DetailViewProps = {
  attributes: Readonly<Record<string, unknown>>;
  colors: ColorPalette;
  isRefetching: boolean;
  item: ResourceMenuItem;
  itemId: string;
  onRefresh: () => void;
  parentId?: string;
  row: RowModel;
  refreshFailed: boolean;
  scopeParams: Readonly<Record<string, string>>;
};

/** Header, attributes, related lists, and the item's write actions. */
export function DetailView({
  attributes,
  colors,
  isRefetching,
  item,
  itemId,
  onRefresh,
  parentId,
  row,
  refreshFailed,
  scopeParams,
}: DetailViewProps) {
  const openChild = useChildNavigation(item.id, row);
  const rows = useMemo(() => attributeRows(attributes), [attributes]);
  const links = useMemo(() => childLinks(item.id), [item.id]);
  const { actions, runningId, trigger } = useDetailActions({
    itemId,
    parentId,
    resourceId: item.id,
    scopeParams,
    subject: row.title,
  });

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl onRefresh={onRefresh} refreshing={isRefetching} tintColor={colors.muted} />
      }
    >
      <DetailHeader colors={colors} icon={item.icon} row={row} />
      {refreshFailed ? <InlineNotice colors={colors} onPress={onRefresh} message="Couldn’t refresh. Showing saved details. Tap to retry." /> : null}
      {links.length > 0 ? <ChildRows colors={colors} links={links} onPress={openChild} /> : null}
      {actions.length > 0 ? (
        <ActionRows actions={actions} colors={colors} onPress={trigger} runningId={runningId} />
      ) : null}
      {rows.length > 0 ? <AttributeRows colors={colors} rows={rows} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingBottom: 48,
    paddingHorizontal: 24,
    paddingTop: 4,
  },
});
