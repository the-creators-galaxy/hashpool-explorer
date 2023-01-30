import { HashpoolRestClient } from "@bugbytes/hapi-hashpool";
import { MirrorRestClient, type NodeInfo } from "@bugbytes/hapi-mirror";
import { ref } from "vue";

export type KnownNetwork = "mainnet" | "testnet" | "previewnet";

/**
 * Remote server details the user interface is relying upon for information.
 */
export interface ConfigInfo {
  hashpoolEndpoint: string;
  mirrorEndpoint: string;
  network: KnownNetwork;
  nodes: NodeInfo[];
  hashscanBaseUrl: string;
  uiVersion: string;
}
/**
 * Stores a persistent value for the network information.
 */
export const config = ref<ConfigInfo>({} as ConfigInfo);
/**
 * Method that invoked to ensure the configuration is loaded.
 * Components at the root of the dom tree should call this
 * method in mount to ensure the `config` reference is
 * properly initialized.  At this tme that is the app root
 * and the header (which the app root displays during loading)
 * If the configuation does not pass sanity checks, a rejected
 * promise is returned and `config` will be in an invalid state
 */
let loadTask: Promise<void>;
export function ensureConfiguration(): Promise<void> {
  if (!loadTask) {
    loadTask = loadConfiguration();
  }
  return loadTask;
}
async function loadConfiguration(): Promise<void> {
  const hashpoolClient = new HashpoolRestClient(
    import.meta.env.VITE_API_HASHPOOL_URL
  );
  const info = await hashpoolClient.getInfo();
  const network = guessNetwork(info.mirror_node);
  const nodes: NodeInfo[] = [];
  const mirrorClient = new MirrorRestClient(info.mirror_node);
  for await (const node of mirrorClient.getNodes()) {
    nodes.push(node);
  }
  config.value = {
    hashpoolEndpoint: import.meta.env.VITE_API_HASHPOOL_URL,
    mirrorEndpoint: info.mirror_node,
    network,
    nodes,
    hashscanBaseUrl: `https://hashscan.io/${network}`,
    uiVersion: __APP_VERSION__,
  };
  if (!(typeof HTMLDialogElement === "function")) {
    throw new Error(
      "Sorry, this browser does not have required functionality enabled (specifically native dialog support)."
    );
  }
  if (!navigator?.clipboard) {
    throw new Error(
      "Sorry, this browser does not have required functionality enabled (specifically clipboard support)."
    );
  }
}
/**
 * Helper function that attempts to produce a human readable name for
 * the currently connected hedera ledger.
 *
 * @param url url for the remote network node.
 */
function guessNetwork(url: string): KnownNetwork {
  if (url) {
    const parts = url.toLowerCase().trim().split(".");
    if (parts.length > 0) {
      switch (parts[0]) {
        case "https://mainnet":
        case "https://mainnet-public":
          return "mainnet";
        case "https://testnet":
          return "testnet";
        case "https://previewnet":
          return "previewnet";
      }
    }
  }
  return "mainnet";
}

export function createMirrorClient(): MirrorRestClient {
  return new MirrorRestClient(config.value.mirrorEndpoint);
}
export function createHashpoolClient(): HashpoolRestClient {
  return new HashpoolRestClient(config.value.hashpoolEndpoint);
}
