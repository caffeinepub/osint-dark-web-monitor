import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Transaction {
    id: string;
    status: string;
    memo: string;
    recipient: string;
    sender: string;
    timestamp: bigint;
    amount: number;
}
export interface backendInterface {
    getBalance(): Promise<number>;
    getTransactionCount(): Promise<bigint>;
    getTransactions(): Promise<Array<Transaction>>;
    resetBalance(): Promise<void>;
    sendFlashTransaction(recipient: string, amount: number, memol: string): Promise<string>;
}
