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

                
                <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
                  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-300 text-white">
        ✨
    </div>

    <div>
        <h2 className="text-xl font-semibold text-gray-900">
            AI Analysis
        </h2>

        <p className="mt-1 text-sm text-gray-500">
            AI-powered analysis of this failed payment
        </p>
    </div>
</div>
                    </div>
                    

                    {aiAnalysis ? (
                        <div className="space-y-3">

                            <div className="grid gap-4 md:grid-cols-3">
                                <p className="text-sm text-gray-500">
                                    Risk Level
                                </p>

                                <div>
                                    <span
                            className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${
                                aiAnalysis.riskLevel === "LOW"
                                    ? "bg-green-100 text-green-700"
                                    : aiAnalysis.riskLevel === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : aiAnalysis.riskLevel === "HIGH"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                       }`}
                                          >
                                     {aiAnalysis.riskLevel || "N/A"}
                                    </span>
                                </div>
                                <p className="font-medium">
                                    {aiAnalysis.riskLevel || "N/A"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
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

                             {aiAnalysis.recoveryProbability != null && (
                              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full bg-black transition-all"
                                style={{
                                    width: `${Math.min(
                                        Math.max(
                                            aiAnalysis.recoveryProbability * 100,
                                            0
                                  ),
                                100
                                  )}%`,
                                }}
                            />
                            </div>
                        )}

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
                              <div className="mt-4 rounded-xl border border-green-100 bg-green-50/50 p-5">

                <div className="flex items-center gap-2">
                    <span className="text-lg"></span>

                    <h3 className="font-semibold text-gray-900">
                        AI Recommendation
                    </h3>
                </div>

                <p className="mt-3 leading-7 text-gray-700">
                    {aiAnalysis.message ||
                        "No recommendation message was provided."}
                </p>
            </div>


                        </div>
                    ) : (
                        <p className="text-gray-500">
                            No AI analysis available.
                        </p>
                    )}
                </div>


                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-5">
        <h2 className="text-xl font-semibold">
            Recovery
        </h2>

        <p className="mt-1 text-sm text-gray-500">
            AI-driven recovery action for this payment
        </p>
    </div>

    {recoveryActions && recoveryActions.length > 0 ? (
        <div className="space-y-5">

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                    AI Recommendation
                </p>

                <p className="mt-1 text-lg font-semibold">
                    {aiAnalysis?.recommendedAction || "N/A"}
                </p>
            </div>


            <div className="grid gap-4 md:grid-cols-3">

            
                <div className="rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">
                        Status
                    </p>

                    <div className="mt-2">
                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                recoveryActions[0]?.status === "EXECUTED"
                                    ? "bg-green-100 text-green-700"
                                    : recoveryActions[0]?.status === "FAILED"
                                    ? "bg-red-100 text-red-700"
                                    : recoveryActions[0]?.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            {recoveryActions[0].status || "N/A"}
                        </span>
                    </div>
                </div>

             
                <div className="rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">
                        Action Taken
                    </p>

                    <p className="mt-2 font-semibold">
                        {recoveryActions[0].action || "N/A"}
                    </p>
                </div>

      
                <div className="rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">
                        Time
                    </p>

                    <p className="mt-2 font-medium">
                        {recoveryActions[0].createdAt
                            ? new Date(
                                  recoveryActions[0].createdAt
                              ).toLocaleString()
                            : "N/A"}
                    </p>
                </div>
            </div>

            <div
            className={`rounded-xl border p-5 ${
                recoveryActions[0]?.status === "EXECUTED"
                    ? "border-green-200 bg-green-50"
                    : recoveryActions[0]?.status === "FAILED"
                    ? "border-red-200 bg-red-50"
                    : "border-yellow-200 bg-yellow-50"
            }`}
        >
            <p
                className={`text-sm font-medium ${
                    recoveryActions[0]?.status === "EXECUTED"
                        ? "text-green-700"
                        : recoveryActions[0]?.status === "FAILED"
                        ? "text-red-700"
                        : "text-yellow-700"
                }`}
            >
                Recovery Result
            </p>

            <p className="mt-1 text-gray-700">
                {recoveryActions[0]?.status === "EXECUTED"
                    ? recoveryActions[0]?.action === "SEND_REMINDER"
                        ? "Recovery email sent successfully."
                        : "Recovery action executed successfully."
                    : recoveryActions[0]?.status === "FAILED"
                    ? "Recovery action failed."
                    : "Recovery action is pending."}
            </p>
        </div>

    </div>
) : (
    <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
        <p className="text-gray-500">
            No recovery action available.
        </p>
    </div>
)}
</div>
</div>
</main>
)};