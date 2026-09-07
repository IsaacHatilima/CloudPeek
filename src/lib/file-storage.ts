/**
 * A document-directory adapter for zustand's `persist`: the home for state that
 * must survive a relaunch but is not a secret.
 *
 * Not the keychain: keychain items survive an app uninstall (a reinstall would
 * inherit the previous selection) and cannot be read while the device is
 * locked. Not AsyncStorage: `expo-file-system` is an Expo-maintained module
 * with a synchronous API, so hydration completes during store creation and
 * the app reopens where it was left with no empty first frame.
 *
 * A failed read returns `null` (defaults apply) after reporting; a failed write
 * is reported and swallowed. Nothing here is worth crashing over.
 */
import { File, Paths } from "expo-file-system";
import type { StateStorage } from "zustand/middleware";

import { reportStorageFailure } from "./storage-failure";

/** One file per persisted store, named after the store's persist `name`. */
function fileFor(name: string): File {
  return new File(Paths.document, `${name}.json`);
}

export const fileStorage: StateStorage = {
  getItem: (name) => {
    try {
      const file = fileFor(name);
      return file.exists ? file.textSync() : null;
    } catch (error) {
      reportStorageFailure("file", "read", name, error);
      return null;
    }
  },
  removeItem: (name) => {
    try {
      const file = fileFor(name);
      if (file.exists) file.delete();
    } catch (error) {
      reportStorageFailure("file", "remove", name, error);
    }
  },
  setItem: (name, value) => {
    try {
      const file = fileFor(name);
      if (!file.exists) file.create({ intermediates: true });
      file.write(value);
    } catch (error) {
      reportStorageFailure("file", "write", name, error);
    }
  },
};
