import * as SecureStore from "expo-secure-store";
import { TokenCache } from "@clerk/clerk-expo/dist/cache";

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};
