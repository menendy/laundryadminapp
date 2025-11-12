// utils/networkWatcher.ts
import NetInfo from "@react-native-community/netinfo";

type Listener = (status: boolean) => void;

class NetworkWatcher {
  private static instance: NetworkWatcher;
  private listeners: Set<Listener> = new Set();
  private initialized = false;

  static getInstance() {
    if (!NetworkWatcher.instance) {
      NetworkWatcher.instance = new NetworkWatcher();
    }
    return NetworkWatcher.instance;
  }

  init() {
    if (this.initialized) return;

    NetInfo.addEventListener((state) => {
      const isConnected = !!state.isConnected;
      this.listeners.forEach((fn) => fn(isConnected));
    });

    this.initialized = true;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const networkWatcher = NetworkWatcher.getInstance();
