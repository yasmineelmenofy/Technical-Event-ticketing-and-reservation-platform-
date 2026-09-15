export type PaymentStatus = "accepted" | "rejected";

export type Payment = {
  id: number;
  reservation_id: number;
  transaction_id: string;
  amount: string | number;
  created_at: string;
  status: PaymentStatus;
};