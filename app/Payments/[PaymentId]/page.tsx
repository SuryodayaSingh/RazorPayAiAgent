"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Payment {
    _id: string;
    razorpayPaymentId: string;
    status: string;
    email: string;
    ErrorDescription?: string;
    riskLevel?: string;
    recoveryProbability?: number;
    aiAction?: string;
    aiReason?: string;
}

interface AIAnalysis {
    _id: string;
    paymentId: string;
    riskLevel?: string;
    recoveryProbability?: number;
    recommendedAction?: string;
    reason?: string;
    message?: string;
    createdAt?: string;
}

interface RecoveryAction {
    _id: string;
    paymentId: string;
    action?: string;
    status?: string;
    createdAt?: string;
}

interface PaymentDetailsResponse {
    success: boolean;
    payment: Payment;
    aiAnalysis: AIAnalysis | null;
    recoveryActions: RecoveryAction[];
    message?: string;
}

export default function PaymentDetailsPage() {
    const params = useParams();
    const PaymentId = params.PaymentId as string;

    const [data, setData] = useState<PaymentDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!PaymentId) return;

        const fetchPaymentDetails = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `/api/Payments/${PaymentId}`
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Failed to fetch payment details"
                    );
                }

                setData(result);
            } catch (error) {
                console.error("Payment Details Error:", error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentDetails();
    }, [PaymentId]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">
                    Loading payment details...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="rounded-lg border p-6">
                    <h2 className="text-xl font-semibold text-red-600">
                        Error
                    </h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const { payment, aiAnalysis, recoveryActions } = data;

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-6xl">

                <div className="mb-6">
                    <h1 className="text-3xl font-bold">
                        Payment Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Payment ID: {payment.razorpayPaymentId}
                    </p>
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">
                        Payment Information
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                        <div>
                            <p className="text-sm text-gray-500">
                                Payment ID
                            </p>
                            <p className="font-medium">
                                {payment.razorpayPaymentId}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Status
                            </p>

                            <span
                                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                                    payment.status === "failed"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                }`}
                            >
                                {payment.status}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Customer Email
                            </p>
                            <p className="font-medium">
                                {payment.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Failure Reason
                            </p>
                            <p className="font-medium">
                                {payment.ErrorDescription || "N/A"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Risk Level
                            </p>
                            <p className="font-medium">
                                {payment.riskLevel || "N/A"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Recovery Probability
                            </p>
                            <p className="font-medium">
                                {payment.recoveryProbability != null
                                    ? `${Math.round(
                                          payment.recoveryProbability * 100
                                      )}%`
                                    : "N/A"}
                            </p>
                        </div>

                    </div>
                </div>

                {/* AI Analysis */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">
                        AI Analysis
                    </h2>

                    {aiAnalysis ? (
                        <div className="space-y-3">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Risk Level
                                </p>
                                <p className="font-medium">
                                    {aiAnalysis.riskLevel || "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Recovery Probability
                                </p>
                                <p className="font-medium">
                                    {aiAnalysis.recoveryProbability != null
                                        ? `${Math.round(
                                              aiAnalysis.recoveryProbability *
                                                  100
                                          )}%`
                                        : "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Recommended Action
                                </p>
                                <p className="font-medium">
                                    {aiAnalysis.recommendedAction || "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Reasoning
                                </p>
                                <p className="text-gray-700">
                                    {aiAnalysis.reason || "N/A"}
                                </p>
                            </div>

                        </div>
                    ) : (
                        <p className="text-gray-500">
                            No AI analysis available.
                        </p>
                    )}
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">
                        Recovery Actions
                    </h2>

                    {recoveryActions.length > 0 ? (
                        <div className="space-y-3">
                            {recoveryActions.map((action) => (
                                <div
                                    key={action._id}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium">
                                            {action.action || "Recovery Action"}
                                        </p>

                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                                            {action.status || "N/A"}
                                        </span>
                                    </div>

                                    {action.createdAt && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            {new Date(
                                                action.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            No recovery actions available.
                        </p>
                    )}
                </div>

            </div>
        </main>
    );
}
