/**
 * Safe storage utility that gracefully handles sandboxed iframe environments
 * or browsers with third-party cookie/storage access restrictions.
 */
class SafeStorage {
  private memoryStore = new Map<string, string>();
  private available: boolean | null = null;

  private isStorageAvailable(): boolean {
    if (this.available !== null) return this.available;
    try {
      if (typeof window === 'undefined') {
        this.available = false;
        return false;
      }
      // Accessing window.localStorage can throw a SecurityError in iframes
      const storage = window.localStorage;
      if (!storage) {
        this.available = false;
        return false;
      }
      const testKey = '__test_storage_access__';
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      this.available = true;
      return true;
    } catch {
      this.available = false;
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.isStorageAvailable()) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return this.memoryStore.get(key) ?? null;
      }
    }
    return this.memoryStore.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.isStorageAvailable()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        this.memoryStore.set(key, value);
        return;
      }
    }
    this.memoryStore.set(key, value);
  }

  removeItem(key: string): void {
    if (this.isStorageAvailable()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
    this.memoryStore.delete(key);
  }
}

export const safeStorage = new SafeStorage();
