import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Float "mo:core/Float";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  var balance = 10_000.0;

  type Transaction = {
    id : Text;
    sender : Text;
    recipient : Text;
    amount : Float;
    memo : Text;
    status : Text;
    timestamp : Int;
  };

  module Transaction {
    public func compare(t1 : Transaction, t2 : Transaction) : Order.Order {
      Int.compare(t2.timestamp, t1.timestamp);
    };
  };

  let transactions = List.empty<Transaction>();
  let transactionIdCounter = Map.empty<Text, Nat>();

  public query ({ caller }) func getBalance() : async Float {
    balance;
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    transactions.toArray().sort();
  };

  func getNextTransactionId(prefix : Text) : Text {
    let count = switch (transactionIdCounter.get(prefix)) {
      case (null) { 0 };
      case (?value) { value };
    };
    transactionIdCounter.add(prefix, count + 1);
    prefix # "-" # count.toText();
  };

  public shared ({ caller }) func sendFlashTransaction(recipient : Text, amount : Float, memol : Text) : async Text {
    let memo = if (memol == "") { "Flash USDT Transaction" } else { memol };
    let senderAddress = "FlashUSDT";

    if (amount <= 0) {
      Runtime.trap("Amount must be greater than 0");
    };

    if (amount > balance) {
      Runtime.trap("Insufficient funds");
    };

    let transactionId = getNextTransactionId(recipient);

    let newTransaction : Transaction = {
      id = transactionId;
      sender = senderAddress;
      recipient;
      amount;
      memo;
      status = "Pending";
      timestamp = Time.now() / 1_000_000_000; // Convert to seconds
    };

    balance -= amount;
    transactions.add(newTransaction);

    // Simulate delay and update status to Confirmed
    let confirmedTransaction : Transaction = {
      id = transactionId;
      sender = senderAddress;
      recipient;
      amount;
      memo;
      status = "Confirmed";
      timestamp = Time.now() / 1_000_000_000;
    };

    // Update transaction in list
    let updatedTransactions = transactions.toArray().map(
      func(tx) {
        if (tx.id == transactionId) { confirmedTransaction } else { tx };
      }
    );
    transactions.clear();
    transactions.addAll(updatedTransactions.values());

    transactionId;
  };

  public shared ({ caller }) func resetBalance() : async () {
    balance := 10_000.0;
  };

  public query ({ caller }) func getTransactionCount() : async Nat {
    transactions.size();
  };
};
