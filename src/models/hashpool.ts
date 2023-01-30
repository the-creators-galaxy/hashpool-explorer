import type {
  TransactionInfo,
  TransactionSummary,
} from "@bugbytes/hapi-hashpool";
import {
  SignatureMap,
  TransactionBody,
  type TransactionID,
  type TransactionReceipt,
} from "@bugbytes/hapi-proto";
import type { TransactionIdKeyString } from "@bugbytes/hapi-util";
import { createHashpoolClient } from "./config";

export async function getTransactions(): Promise<TransactionSummary[]> {
  const client = createHashpoolClient();
  return await client.getTransactions();
}

export async function getTransactionData(
  transactionId: TransactionIdKeyString
): Promise<{
  info: TransactionInfo;
  bytes: Uint8Array;
  body: TransactionBody;
  signatures: SignatureMap;
}> {
  const client = createHashpoolClient();
  const data = await Promise.all([
    client.getTransactionStatus(transactionId),
    client.getSignedTransaction(transactionId),
  ]);
  const info = data[0];
  const bytes = data[1].bodyBytes;
  const body = TransactionBody.decode(bytes);
  const signatures = data[1].sigMap ?? SignatureMap.fromPartial({});
  return { info, bytes, body, signatures };
}

export async function getTransactionReceipt(
  transactionID: TransactionID
): Promise<TransactionReceipt> {
  const now = new Date();
  const startTime = new Date(
    transactionID.transactionValidStart!.seconds * 1000 +
      transactionID.transactionValidStart!.nanos / 1000000.0
  );
  const delay = startTime.getTime() - now.getTime() + 5000; // (add 5s margin)
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  const client = createHashpoolClient();
  return await client.getTransactionReceipt(transactionID);
}

export async function addSignatures(
  transactionId: TransactionID,
  sigMap: Uint8Array
): Promise<SignatureMap> {
  const client = createHashpoolClient();
  const result = await client.addSignatures(transactionId, sigMap);
  return result.sigMap ?? SignatureMap.fromPartial({});
}
