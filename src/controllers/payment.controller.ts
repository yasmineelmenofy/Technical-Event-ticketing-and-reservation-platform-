import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

import {
  createPayment,
  fetchPaymentById,
  fetchPaymentByReservation,
  modifyPaymentStatus,
} from "../services/payment.service.js";

import { PaymentStatus } from "../models/payment.model.js";

const isValidId = (value: unknown): value is number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

const isValidPaymentStatus = (
  value: unknown,
): value is PaymentStatus => {
  return value === "accepted" || value === "rejected";
};

export const createPaymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const reservationId = Number(req.params.reservationId);
    const { transaction_id, status } = req.body;

    if (!isValidId(reservationId)) {
      throw new AppError(400, "Invalid reservation id");
    }

    if (
      typeof transaction_id !== "string" ||
      transaction_id.trim().length === 0
    ) {
      throw new AppError(400, "Invalid transaction id");
    }

    if (!isValidPaymentStatus(status)) {
      throw new AppError(400, "Invalid payment status");
    }

    const payment = await createPayment(
      req.user!.userId,
      reservationId,
      transaction_id.trim(),
      status,
    );

    res.status(201).json({
      message: "Payment created successfully",
      data: payment,
    });
  },
);

export const fetchPaymentByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const paymentId = Number(req.params.id);

    if (!isValidId(paymentId)) {
      throw new AppError(400, "Invalid payment id");
    }

    const payment = await fetchPaymentById(
      paymentId,
      req.user!.userId,
      req.user!.role,
    );

    res.status(200).json({
      message: "Payment retrieved successfully",
      data: payment,
    });
  },
);

export const fetchPaymentByReservationController =
  asyncHandler(
    async (req: Request, res: Response) => {
      const reservationId = Number(
        req.params.reservationId,
      );

      if (!isValidId(reservationId)) {
        throw new AppError(
          400,
          "Invalid reservation id",
        );
      }

      const payment =
        await fetchPaymentByReservation(
          reservationId,
          req.user!.userId,
          req.user!.role,
        );

      res.status(200).json({
        message: "Payment retrieved successfully",
        data: payment,
      });
    },
  );

export const modifyPaymentStatusController =
  asyncHandler(
    async (req: Request, res: Response) => {
      const paymentId = Number(req.params.id);
      const { status } = req.body;

      if (!isValidId(paymentId)) {
        throw new AppError(400, "Invalid payment id");
      }

      if (!isValidPaymentStatus(status)) {
        throw new AppError(400, "Invalid payment status");
      }

      const payment =
        await modifyPaymentStatus(
          paymentId,
          status,
          req.user!.userId,
          req.user!.role,
        );

      res.status(200).json({
        message: "Payment status updated successfully",
        data: payment,
      });
    },
  );