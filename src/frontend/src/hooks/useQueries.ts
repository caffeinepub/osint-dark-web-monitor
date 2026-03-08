import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "../backend.d";
import { useActor } from "./useActor";

export function useGetBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getBalance();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useGetTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTransactionCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["transactionCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTransactionCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendFlashTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipient,
      amount,
      memo,
    }: {
      recipient: string;
      amount: number;
      memo: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.sendFlashTransaction(recipient, amount, memo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionCount"] });
    },
  });
}

export function useResetBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.resetBalance();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionCount"] });
    },
  });
}
