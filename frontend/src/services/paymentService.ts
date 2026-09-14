import { apiFetch } from "../api/api";
import type {
  Payment,
  PaymentStatus,
} from "../types/payment";

type PaymentResponse = {
  message: string;
  data: Payment;
};

export async function processPayment(
  reservationId: number,
  transactionId: string,
  status: PaymentStatus,
) {
  const response = await apiFetch(
    `/api/payments/reservations/${reservationId}`,
    {
      method: "POST",
      body: JSON.stringify({
        transaction_id: transactionId,
        status,
      }),
    },
  );

  return (response as PaymentResponse).data;
}

export async function getPaymentByReservation(
  reservationId: number,
) {
  const response = await apiFetch(
    `/api/payments/reservations/${reservationId}`,
  );

  return (response as PaymentResponse).data;
}