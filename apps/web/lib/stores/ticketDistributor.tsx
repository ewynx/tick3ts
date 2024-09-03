// lib/stores/ticketDistributor.tsx

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Client, useClientStore } from "./client";
import { useWalletStore } from "./wallet";
import { useCallback } from "react";
import { PublicKey } from "o1js";
import { PendingTransaction, UnsignedTransaction } from "@proto-kit/sequencer";

export interface TicketDistributorState {
  loading: boolean;
  initializeState: (client: Client, walletAddress: string) => Promise<PendingTransaction>;
}

function isPendingTransaction(
  transaction: PendingTransaction | UnsignedTransaction | undefined,
): asserts transaction is PendingTransaction {
  if (!(transaction instanceof PendingTransaction))
    throw new Error("Transaction is not a PendingTransaction");
}
export const useTicketDistributorStore = create<
  TicketDistributorState,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    loading: false,
    async initializeState(client: Client, address: string) {
      const distributorModule = client.runtime.resolve("TieredTicketDistributor");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, async () => {
        await distributorModule.initializeState();
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },
  }))
);

export const initDistributor = () => {
  const client = useClientStore();
  const wallet = useWalletStore();
  const distributor = useTicketDistributorStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await distributor.initializeState(
      client.client,
      wallet.wallet,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
}

export const addCode = () => {
  const client = useClientStore();
  const wallet = useWalletStore();
  const distributor = useTicketDistributorStore();

  return useCallback(async (code: string) => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await distributor.initializeState(
      client.client,
      wallet.wallet,
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
}