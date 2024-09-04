// lib/stores/ticketDistributor.tsx

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Client, useClientStore } from "./client";
import { useWalletStore } from "./wallet";
import { useCallback, useEffect } from "react";
import { Field, Provable, PublicKey, UInt8 } from "o1js";
import { PendingTransaction, UnsignedTransaction } from "@proto-kit/sequencer";

export interface TicketDistributorState {
  loading: boolean;
  standardTierCounter: string;
  topTierCounter: string;
  resetCounters: (client: Client, walletAddress: string) => Promise<PendingTransaction>;
  addCode: (client: Client, walletAddress: string, code: string) => Promise<PendingTransaction>;
  registerStandardTier: (client: Client, walletAddress: string, code: string) => Promise<PendingTransaction>;
  registerTopTier: (client: Client, walletAddress: string, code: string) => Promise<PendingTransaction>;
  loadDistributorState: (client: Client) => Promise<void>;
  distributeTopTicketClaims: (client: Client, walletAddress: string, luckyNumber: number) => Promise<PendingTransaction>;
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
    standardTierCounter: "0",
    topTierCounter: "0",
    async resetCounters(client: Client, address: string) {
      const distributorModule = client.runtime.resolve("TieredTicketDistributor");
      const sender = PublicKey.fromBase58(address);

      const tx = await client.transaction(sender, async () => {
        await distributorModule.resetCounters();
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },
    async addCode(client: Client, address: string, code: string) {
      const distributorModule = client.runtime.resolve("TieredTicketDistributor");
      const sender = PublicKey.fromBase58(address);
      const codeField = Field.from(code); // TODO error handling

      const tx = await client.transaction(sender, async () => {
        await distributorModule.addCodes(codeField);
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },
    async registerStandardTier(client: Client, address: string, code: string) {
      const distributorModule = client.runtime.resolve("TieredTicketDistributor");
      const sender = PublicKey.fromBase58(address);
      const codeField = Field.from(code); // TODO error handling

      const tx = await client.transaction(sender, async () => {
        await distributorModule.registerStandardTier(codeField, sender);
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },
    async registerTopTier(client: Client, address: string, code: string) {
      const distributorModule = client.runtime.resolve("TieredTicketDistributor");
      const sender = PublicKey.fromBase58(address);
      const codeField = Field.from(code); // TODO error handling

      const tx = await client.transaction(sender, async () => {
        await distributorModule.registerTopTier(codeField, sender);
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    },
    async loadDistributorState(client: Client) {
      set((state) => {
        state.loading = true;
      });

      const counter = await client.query.runtime.TieredTicketDistributor.standardTierCounter.get();

      set((state) => {
        state.loading = false;
        state.standardTierCounter = counter?.toString() ?? "0";
      });
    },
    async distributeTopTicketClaims(client: Client, address: string, luckyNumber: number) {
      const distributorModule = client.runtime.resolve("TieredTicketDistributor");
      const sender = PublicKey.fromBase58(address);
      
      const tx = await client.transaction(sender, async () => {
        await distributorModule.distributeTopTicketClaims(UInt8.from(luckyNumber));
      });

      await tx.sign();
      await tx.send();

      isPendingTransaction(tx.transaction);
      return tx.transaction;
    }
  }))
);

export const resetCountersDistributor = () => {
  const client = useClientStore();
  const wallet = useWalletStore();
  const distributor = useTicketDistributorStore();

  return useCallback(async () => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await distributor.resetCounters(
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

    const pendingTransaction = await distributor.addCode(
      client.client,
      wallet.wallet,
      code
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
}

export const useRegisterStandardTicket = () => {
  const client = useClientStore();
  const wallet = useWalletStore();
  const distributor = useTicketDistributorStore();

  return useCallback(async (code: string) => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await distributor.registerStandardTier(
      client.client,
      wallet.wallet,
      code
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
}

export const useRegisterTopTicket = () => {
  const client = useClientStore();
  const wallet = useWalletStore();
  const distributor = useTicketDistributorStore();

  return useCallback(async (code: string) => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await distributor.registerTopTier(
      client.client,
      wallet.wallet,
      code
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
}

export const useObserveDistributorState = () => {
  const client = useClientStore();
  const wallet = useWalletStore();
  const distributor = useTicketDistributorStore();
  
  useEffect(() => {
    if (!client.client || !wallet.wallet) return;

    distributor.loadDistributorState(client.client);
  }, [client.client, wallet.wallet]);
};

// New Hook to access standardTierCounter
export const useStandardTierCounter = () => {
  return useTicketDistributorStore((state) => state.standardTierCounter);
};

export const useTopTierCounter = () => {
  return useTicketDistributorStore((state) => state.topTierCounter);
}

export const useDrawTopTier = () => {
  const client = useClientStore();
  const wallet = useWalletStore();
  const distributor = useTicketDistributorStore();

  return useCallback(async (luckyNumber: number) => {
    if (!client.client || !wallet.wallet) return;

    const pendingTransaction = await distributor.distributeTopTicketClaims(
      client.client,
      wallet.wallet,
      luckyNumber
    );

    wallet.addPendingTransaction(pendingTransaction);
  }, [client.client, wallet.wallet]);
}