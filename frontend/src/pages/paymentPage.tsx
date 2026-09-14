import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { processPayment } from "../services/paymentService";

function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const reservationId = Number(id);

  const [transactionId, setTransactionId] = useState("");

  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");

  async function handlePayment(status: "accepted" | "rejected") {
    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      setError("Invalid reservation id");
      return;
    }

    if (transactionId.trim().length === 0) {
      setError("Enter a transaction id");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const payment = await processPayment(
        reservationId,
        transactionId.trim(),
        status,
      );

      if (payment.status === "accepted") {
        navigate(`/reservations/${reservationId}/success`);
        return;
      }

      setError("Payment was rejected. Your reservation is still pending.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Payment</p>

        <h2>Complete your payment</h2>

        <p className="page-description">Reservation #{reservationId}</p>
      </div>

      {error && (
        <div className="state-message error-message payment-message">
          {error}
        </div>
      )}

      <div className="payment-card">
        <label htmlFor="transaction-id">Transaction ID</label>

        <input
          id="transaction-id"
          type="text"
          value={transactionId}
          onChange={(event) => setTransactionId(event.target.value)}
          placeholder="TX-2026-TEST-001"
        />

        <p className="summary-note">
          This project currently simulates the payment provider.
        </p>

        <div className="payment-actions">
          <button
            type="button"
            className="primary-button"
            disabled={processing}
            onClick={() => handlePayment("accepted")}
          >
            {processing ? "Processing..." : "Pay Successfully"}
          </button>

          <button
            type="button"
            className="secondary-button"
            disabled={processing}
            onClick={() => handlePayment("rejected")}
          >
            Simulate Rejected Payment
          </button>
        </div>
      </div>
    </section>
  );
}

export default PaymentPage;
