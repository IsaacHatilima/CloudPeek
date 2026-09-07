import * as ImagePicker from "expo-image-picker";
import { SymbolView } from "expo-symbols";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { ColorPalette } from "@/theme/types";

import type { FileValue } from "../form-model";

type FieldFileProps = {
  colors: ColorPalette;
  label: string;
  onChange: (value: FileValue | null) => void;
  value: FileValue | null;
};

const DEFAULT_FILE_NAME = "avatar.jpg";

export function fileFromAsset(asset: ImagePicker.ImagePickerAsset): FileValue {
  return { mimeType: asset.mimeType, name: asset.fileName ?? DEFAULT_FILE_NAME, uri: asset.uri };
}

async function pickImage(): Promise<FileValue | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ["images"],
    quality: 0.9,
  });
  const asset = result.canceled ? null : result.assets[0];
  return asset ? fileFromAsset(asset) : null;
}

/** An image from the photo library, previewed once chosen. */
export function FieldFile({ colors, label, onChange, value }: FieldFileProps) {
  const choose = async () => {
    try {
      const picked = await pickImage();
      if (picked) onChange(picked);
    } catch (error) {
      Alert.alert("Could not open the photo library", error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <View style={styles.row}>
      {value ? (
        <Image accessibilityIgnoresInvertColors source={{ uri: value.uri }} style={styles.preview} />
      ) : null}
      <Pressable
        accessibilityLabel={value ? `Replace ${label}` : `Choose ${label}`}
        accessibilityRole="button"
        onPress={() => void choose()}
        style={[styles.button, { backgroundColor: colors.cardBackground }]}
      >
        <SymbolView name={{ ios: "photo", android: "image", web: "image" }} size={18} tintColor={colors.accent} />
        <Text style={[styles.buttonLabel, { color: colors.text }]}>
          {value ? value.name : "Choose image"}
        </Text>
      </Pressable>
      {value ? (
        <Pressable accessibilityLabel={`Remove ${label}`} accessibilityRole="button" onPress={() => onChange(null)}>
          <Text style={[styles.remove, { color: colors.muted }]}>Remove</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  preview: {
    borderCurve: "continuous",
    borderRadius: 20,
    height: 48,
    width: 48,
  },
  button: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 20,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  remove: {
    fontSize: 15,
    paddingHorizontal: 4,
  },
});
