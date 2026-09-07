import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useCloudApi } from "@/features/connections/use-cloud-api";
import { toneFor } from "@/features/resources/presenters";
import type { ScopeLevel } from "@/features/workspace/types";
import { useApplicationsCatalog, useEnvironmentsCatalog } from "@/features/workspace/use-catalogs";
import { useConnectedOrganizations, useEnvironments, useWorkspaceSelection } from "@/features/workspace/use-workspace";
import { TONE_COLORS } from "@/theme/tones";
import type { ColorPalette } from "@/theme/types";

import { type BreadcrumbSegment, breadcrumbModel } from "../breadcrumb-model";

type ScopeBreadcrumbProps = {
  colors: ColorPalette;
  onConnect: () => void;
  onOpen: (level: ScopeLevel) => void;
};

/**
 * One line under the title: organization initial › application › environment.
 * It also keeps the application and environment catalogs warm, so the status
 * dot is current and the scope sheet opens with its lists already there.
 */
export function ScopeBreadcrumb({ colors, onConnect, onOpen }: ScopeBreadcrumbProps) {
  const selection = useWorkspaceSelection();
  const organizations = useConnectedOrganizations();
  const environments = useEnvironments();
  const api = useCloudApi();
  useApplicationsCatalog(api);
  useEnvironmentsCatalog(api);
  const model = breadcrumbModel(selection, environments);
  const open = (target: ScopeLevel | "connect") =>
    target === "connect" ? onConnect() : onOpen(target);

  if (organizations.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityLabel={model.accessibilityLabel}
        accessibilityRole="button"
        onPress={() => open(model.opens)}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.cardBackground },
          pressed && styles.pressed,
        ]}
      >
        {model.segments.map((segment, index) => (
          <Segment
            colors={colors}
            key={`${segment.level}-${segment.kind}`}
            onPress={() => open(model.opens === "connect" ? "connect" : segment.level)}
            segment={segment}
            separated={index >= 2}
          />
        ))}
        <SymbolView
          name={{ ios: "chevron.up.chevron.down", android: "unfold_more", web: "unfold_more" }}
          size={13}
          tintColor={colors.muted}
        />
      </Pressable>
    </View>
  );
}

function Segment({
  colors,
  onPress,
  segment,
  separated,
}: {
  colors: ColorPalette;
  onPress: () => void;
  segment: BreadcrumbSegment;
  separated: boolean;
}) {
  return (
    <>
      {separated ? (
        <SymbolView
          name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
          size={11}
          tintColor={colors.muted}
        />
      ) : null}
      <Pressable
        accessibilityLabel={segment.kind === "avatar" ? `Organization ${segment.name}` : segment.label}
        accessibilityRole="button"
        hitSlop={6}
        onPress={onPress}
        style={styles.segment}
      >
        {segment.kind === "avatar" ? (
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={[styles.initial, { color: colors.accentText }]}>{segment.initial}</Text>
          </View>
        ) : (
          <Text
            numberOfLines={1}
            style={[styles.label, { color: segment.kind === "prompt" ? colors.link : colors.text }]}
          >
            {segment.label}
          </Text>
        )}
        {segment.kind === "value" && segment.status ? (
          <View style={[styles.dot, { backgroundColor: TONE_COLORS[toneFor(segment.status)] }]} />
        ) : null}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  row: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  segment: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    paddingVertical: 8,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  initial: {
    fontSize: 11,
    fontWeight: "700",
  },
  label: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
