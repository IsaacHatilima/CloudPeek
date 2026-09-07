import { Touchable } from "@/components/touchable";
import { SymbolView } from "expo-symbols";
import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { TONE_COLORS } from "@/theme/tones";
import type { ColorPalette } from "@/theme/types";

import type { DetailAction } from "../detail-model";
import { DetailCard } from "./detail-card";

type ActionRowsProps = {
  actions: readonly DetailAction[];
  colors: ColorPalette;
  onPress: (action: DetailAction) => void;
  runningId: string | null;
};

/** One tappable row per write: forms show a chevron, confirmations run in place. */
export function ActionRows({ actions, colors, onPress, runningId }: ActionRowsProps) {
  return (
    <DetailCard colors={colors} title="Actions">
      {actions.map((action) => {
        const running = runningId === action.id;
        const color = action.destructive ? TONE_COLORS.negative : colors.accent;
        return (
          <Touchable
            accessibilityRole="button"
            accessibilityState={{ busy: running, disabled: runningId !== null }}
            disabled={runningId !== null}
            key={action.id}
            onPress={() => onPress(action)}
            style={styles.row}
          >
            <Text style={[styles.label, { color }]}>{action.label}</Text>
            {running ? (
              <ActivityIndicator color={color} />
            ) : action.input ? (
              <SymbolView
                name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
                size={14}
                tintColor={colors.muted}
              />
            ) : null}
          </Touchable>
        );
      })}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 50,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});
