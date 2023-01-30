import { createMirrorClient } from "./config";
import type { TransactionIdKeyString } from "@bugbytes/hapi-util";
import { MirrorError, type TransactionInfo } from "@bugbytes/hapi-mirror";

export async function getMirrorTransactionInfo(
  transactionId: TransactionIdKeyString
): Promise<TransactionInfo> {
  const client = createMirrorClient();
  return await client.getTransaction(transactionId);
}

export async function waitMirrorForMirrorTransactionInfo(
  transactionId: TransactionIdKeyString
): Promise<TransactionInfo> {
  const client = createMirrorClient();
  // Retry up to a minute if necessary
  // (mirror node latency)
  for (let i = 0; i < 60; i++) {
    try {
      return await client.getTransaction(transactionId);
    } catch (err) {
      if (err instanceof MirrorError && err.status === 404) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      throw err;
    }
  }
  throw new MirrorError(
    "Unable to retrieve transaction information in a timely manner.",
    404
  );
}
