"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RecoveryData {
    paymentId: string;
    email?: string;
    amount: number;
    currency: string;
}

export default function RecoveryPage() {

    const params = useParams();
    const router = useRouter();

    const paymentId = params.paymentId as string;

    const [payment, setPayment] = useState<RecoveryData | null>(null);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {

        const script = document.createElement("script");

        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };

    }, []);


    useEffect(() => {

        const fetchPayment = async () => {

            try {

                const response = await fetch(
                    `/api/Payments/${paymentId}`
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Failed to load payment"
                    );
                }

                const p = data.payment;

                setPayment({
                    paymentId: p.razorpayPaymentId,
                    email: p.email,
                    amount: p.amount,
                    currency: p.currency || "INR",
                });

            } catch (err: any) {

                console.error(err);

                setError(
                    err.message || "Unable to load payment"
                );

            } finally {

                setLoading(false);

            }
        };

        if (paymentId) {
            fetchPayment();
        }

    }, [paymentId]);



    const startRecoveryPayment = async () => {

        try {

            setProcessing(true);
            setError("");


            const response = await fetch(
                "/api/Payments/recovery",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        paymentId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to create recovery order"
                );
            }



            if (!window.Razorpay) {
                throw new Error(
                    "Razorpay Checkout is not loaded yet. Please try again."
                );
            }


            const options = {

                key: data.key,

                amount: data.order.amount,

                currency: data.order.currency,

                name: "AI Revenue Recovery",

                description: "Recover failed payment",

                order_id: data.order.id,

                prefill: {
                    email: data.payment.email || "",
                },

                theme: {
                    color: "#2563eb",
                },

                handler: async function (
                    razorpayResponse: any
                ) {

                    try {


                        const verifyResponse = await fetch(
                            "/api/Payments/recovery",
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },

                                body: JSON.stringify({

                                    paymentId,

                                    razorpayPaymentId:
                                        razorpayResponse
                                            .razorpay_payment_id,

                                    razorpayOrderId:
                                        razorpayResponse
                                            .razorpay_order_id,

                                    razorpaySignature:
                                        razorpayResponse
                                            .razorpay_signature,
                                }),
                            }
                        );

                        const verifyData =
                            await verifyResponse.json();

                        if (
                            !verifyResponse.ok ||
                            !verifyData.success
                        ) {
                            throw new Error(
                                verifyData.message ||
                                "Payment verification failed"
                            );
                        }


                        router.push(
                            `/recovery/${paymentId}?success=true`
                        );

                    } catch (error: any) {

                        console.error(
                            "Verification error:",
                            error
                        );

                        setError(
                            error.message ||
                            "Payment verification failed"
                        );

                        setProcessing(false);
                    }
                },

                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    },
                },
            };


            const razorpay =
                new window.Razorpay(options);

            razorpay.open();

        } catch (error: any) {

            console.error(
                "Recovery payment error:",
                error
            );

            setError(
                error.message ||
                "Something went wrong"
            );

            setProcessing(false);
        }
    };


    const success =
        typeof window !== "undefined" &&
        new URLSearchParams(
            window.location.search
        ).get("success") === "true";


    if (loading) {

        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-medium">
                        Loading payment...
                    </p>
                </div>
            </main>
        );
    }


    if (success) {

        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">

                        <span className="text-3xl">
                            ✓
                        </span>

                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Payment Successful
                    </h1>

                    <p className="mt-3 text-gray-600">
                        Your failed payment has been successfully
                        recovered.
                    </p>

                    <p className="mt-4 text-sm text-gray-500">
                        Payment ID: {paymentId}
                    </p>

                </div>

            </main>
        );
    }


    if (!payment) {

        return (
            <main className="min-h-screen flex items-center justify-center">

                <div className="text-center">

                    <h1 className="text-xl font-bold">
                        Payment not found
                    </h1>

                    <p className="mt-2 text-gray-500">
                        We could not find this payment.
                    </p>

                </div>

            </main>
        );
    }


    return (
        <main className="min-h-screen bg-gray-50 px-4 py-12">

            <div className="mx-auto max-w-lg">

                <div className="rounded-2xl bg-white p-8 shadow-lg">

                    {/* Header */}

                    <div className="text-center">

                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">

                            <span className="text-2xl">
                                !
                            </span>

                        </div>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Payment Failed
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Don't worry. You can complete your
                            payment securely below.
                        </p>

                    </div>


                    <div className="mt-8 rounded-xl bg-gray-50 p-5">

                        <div className="flex justify-between py-2">

                            <span className="text-gray-500">
                                Payment ID
                            </span>

                            <span className="font-medium text-gray-900">
                                {payment.paymentId}
                            </span>

                        </div>


                        <div className="flex justify-between py-2">

                            <span className="text-gray-500">
                                Amount
                            </span>

                            <span className="text-xl font-bold">
                                ₹{(payment.amount / 100).toFixed(2)}
                            </span>

                        </div>


                        {payment.email && (
                            <div className="flex justify-between py-2">

                                <span className="text-gray-500">
                                    Email
                                </span>

                                <span className="font-medium">
                                    {payment.email}
                                </span>

                            </div>
                        )}

                    </div>


                  

                    {error && (

                        <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>

                    )}


                    <button
                        onClick={startRecoveryPayment}
                        disabled={processing}
                        className="mt-6 w-full rounded-xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {processing
                            ? "Opening Secure Checkout..."
                            : `Pay ₹${(payment.amount / 100).toFixed(2)}`
                        }

                    </button>


                    <p className="mt-4 text-center text-xs text-gray-500">
                        Your payment is securely processed by Razorpay.
                    </p>

                </div>

            </div>

        </main>
    );
}