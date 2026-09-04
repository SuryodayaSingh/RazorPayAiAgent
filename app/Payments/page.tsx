"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        Razorpay: any;
    }
}

type Payment = {
    _id: string;
    razorpayPaymentId: string;
    razorpayOrderId?: string;
    recoveryOrderId?: string;
    recoveryPaymentId?: string;

    recoveryStatus?:
        | "NOT_STARTED"
        | "PENDING"
        | "SUCCESS"
        | "FAILED";

    recoveredAt?: string;

    amount: number;
    currency: string;
    status?: string;
    method?: string;

    email?: string;
    contact?: string;

    errorCode?: string;
    ErrorDescription?: string;

    riskScore?: number;
    riskLevel?: "LOW" | "MEDIUM" | "HIGH";

    recoveryProbability?: number;
    aiAction?: string;
    aiReason?: string;

    createdAtRazorPay?: string;
    createdAt?: string;
};

type PaymentsResponse = {
    success: boolean;
    count: number;
    payments: Payment[];
};

export default function PaymentsPage() {
    const router = useRouter();

    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCustomPayment, setShowCustomPayment] = useState(false);

    const [customPayment, setCustomPayment] = useState({
    name: "",
    email: "",
    contact: "",
    amount: "",
    currency: "INR",
    description: "Custom Payment",
});
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [riskFilter, setRiskFilter] = useState("all");

    const fetchPayments = async () => {
        try {
            setLoading(true);

            const response = await fetch("/api/Payments/list", {
                method: "GET",
                cache: "no-store",
            });

            const data: PaymentsResponse = await response.json();

            if (!response.ok || !data.success) {
                throw new Error("Failed to fetch payments");
            }

            setPayments(data.payments || []);
        } catch (error) {
            console.error("Fetch Payments Error:", error);
            alert("Failed to fetch payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);



    const handleTestPayment = async () => {
        try {
            setPaymentLoading(true);

            const response = await fetch("/api/Payments/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: 499,
                    currency: "INR",
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to create Razorpay order"
                );
            }

            const order = data.order;


            if (!window.Razorpay) {
                throw new Error(
                    "Razorpay Checkout has not loaded yet. Please try again."
                );
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

                amount: order.amount,

                currency: order.currency,

                name: "AI Revenue Recovery",

                description: "Test Payment",

                order_id: order.id,

               handler: async function (paymentResponse: any) {
    try {
        console.log(
            "Razorpay Payment Response:",
            paymentResponse
        );

        const verifyResponse = await fetch(
            "/api/Payments",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    razorpayPaymentId:
                        paymentResponse.razorpay_payment_id,

                    razorpayOrderId:
                        paymentResponse.razorpay_order_id,

                    razorpaySignature:
                        paymentResponse.razorpay_signature,

                    customer: {
                        name: "Test Customer",
                        email: "test@example.com",
                        contact: "9999999999",
                    },
                }),
            }
        );

        const data = await verifyResponse.json();

        if (!verifyResponse.ok || !data.success) {
            console.error("BAckend verification response", data);
            throw new Error(
                data.message || 
                data.error ||
                    "Payment verification failed"
            );
        }

        console.log(
            "Payment verified successfully:",
            data
        );

        alert(
            `Payment verified successfully!\n\nPayment ID: ${paymentResponse.razorpay_payment_id}`
        );

        await fetchPayments();
    } catch (error) {
        console.error(
            "Payment verification error:",
            error
        );

        alert(
            error instanceof Error
                ? error.message
                : "Payment verification failed"
        );
    }
},

                prefill: {
                    name: "Test Customer",
                    email: "test@example.com",
                    contact: "9999999999",
                },

                notes: {
                    project: "AI Revenue Recovery",
                    purpose: "Buildathon Test Payment",
                },

                theme: {
                    color: "#000000",
                },

                modal: {
                    ondismiss: function () {
                        console.log("Razorpay Checkout closed");
                    },
                },
            };

            const razorpayCheckout = new window.Razorpay(options);
            razorpayCheckout.on("payment.failed", function (response: any) {
            console.error("Payment failed:", response);

             alert("Payment failed");
            });

            razorpayCheckout.open();
        } catch (error) {
            console.error("Payment Error:", error);

            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to start payment";

            alert(message);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleCustomPayment = async () => {
    try {
        const amount = Number(customPayment.amount);

        if (!customPayment.name.trim()) {
            alert("Please enter customer name");
            return;
        }

        if (!customPayment.email.trim()) {
            alert("Please enter customer email");
            return;
        }

        if (!customPayment.contact.trim()) {
            alert("Please enter customer contact");
            return;
        }

        if (!amount || amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        setPaymentLoading(true);

        const response = await fetch("/api/Payments/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount,
                currency: customPayment.currency,
                customer: {
                    name: customPayment.name,
                    email: customPayment.email,
                    contact: customPayment.contact,
                },
                description: customPayment.description,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Failed to create payment order"
            );
        }

        const order = data.order;

        if (!window.Razorpay) {
            throw new Error("Razorpay Checkout has not loaded yet.");
        }

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

            amount: order.amount,
            currency: order.currency,
            order_id: order.id,

            name: "AI Revenue Recovery",
            description: customPayment.description,

            prefill: {
                name: customPayment.name,
                email: customPayment.email,
                contact: customPayment.contact,
            },

            notes: {
                project: "AI Revenue Recovery",
                customer_name: customPayment.name,
                customer_email: customPayment.email,
                customer_contact: customPayment.contact,
            },

            theme: {
                color: "#000000",
            },

            handler: async function (paymentResponse: any) {
                try {
                    const verifyResponse = await fetch(
                        "/api/Payments",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                razorpayPaymentId:
                                    paymentResponse.razorpay_payment_id,

                                razorpayOrderId:
                                    paymentResponse.razorpay_order_id,

                                razorpaySignature:
                                    paymentResponse.razorpay_signature,

                                customer: {
                                    name: customPayment.name,
                                    email: customPayment.email,
                                    contact: customPayment.contact,
                                },

                                amount: amount * 100,
                                currency: customPayment.currency,
                            }),
                        }
                    );

                    const result = await verifyResponse.json();

                    if (!verifyResponse.ok || !result.success) {
                        throw new Error(
                            result.message ||
                                result.error ||
                                "Payment verification failed"
                        );
                    }

                    alert(
                        `Payment successful!\n\nPayment ID: ${paymentResponse.razorpay_payment_id}`
                    );

                    setShowCustomPayment(false);

                    setCustomPayment({
                        name: "",
                        email: "",
                        contact: "",
                        amount: "",
                        currency: "INR",
                        description: "Custom Payment",
                    });

                    await fetchPayments();
                } catch (error) {
                    console.error(
                        "Custom payment verification error:",
                        error
                    );

                    alert(
                        error instanceof Error
                            ? error.message
                            : "Payment verification failed"
                    );
                }
            },

            modal: {
                ondismiss: () => {
                    console.log("Custom Razorpay Checkout closed");
                },
            },
        };

        const razorpayCheckout = new window.Razorpay(options);

        razorpayCheckout.on(
            "payment.failed",
            function (response: any) {
                console.error(
                    "Custom payment failed:",
                    response
                );

                alert(
                    response?.error?.description ||
                        "Payment failed"
                );
            }
        );

        razorpayCheckout.open();
    } catch (error) {
        console.error("Custom Payment Error:", error);

        alert(
            error instanceof Error
                ? error.message
                : "Unable to start payment"
        );
    } finally {
        setPaymentLoading(false);
    }
};



    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                !searchText ||
                payment.razorpayPaymentId
                    ?.toLowerCase()
                    .includes(searchText) ||
                payment.razorpayOrderId
                    ?.toLowerCase()
                    .includes(searchText) ||
                payment.email?.toLowerCase().includes(searchText) ||
                payment.method?.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "all" ||
                payment.status?.toLowerCase() ===
                    statusFilter.toLowerCase();

            const matchesRisk =
                riskFilter === "all" ||
                payment.riskLevel?.toLowerCase() ===
                    riskFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesRisk;
        });
    }, [payments, search, statusFilter, riskFilter]);



    const formatAmount = (amount: number, currency: string) => {
        return `${currency} ${(
            amount / 100
        ).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };


    const getStatusClass = (status?: string) => {
        switch (status?.toLowerCase()) {
            case "captured":
                return "bg-green-100 text-green-700";

            case "authorized":
                return "bg-blue-100 text-blue-700";

            case "failed":
                return "bg-red-100 text-red-700";

            case "refunded":
                return "bg-purple-100 text-purple-700";

            case "created":
                return "bg-yellow-100 text-yellow-700";

            case "recovered":
                return "bg-emerald-100 text-emerald-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };


    const getRecoveryClass = (status?: string) => {
        switch (status) {
            case "SUCCESS":
                return "bg-green-100 text-green-700";

            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            case "FAILED":
                return "bg-red-100 text-red-700";

            case "NOT_STARTED":
            default:
                return "bg-gray-100 text-gray-700";
        }
    };



    const getRiskClass = (risk?: string) => {
        switch (risk) {
            case "LOW":
                return "bg-green-100 text-green-700";

            case "MEDIUM":
                return "bg-yellow-100 text-yellow-700";

            case "HIGH":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };



    const totalPayments = payments.length;

    const successfulPayments = payments.filter(
        (payment) => payment.status === "captured"
    ).length;

    const failedPayments = payments.filter(
        (payment) => payment.status === "failed"
    ).length;

    const recoveredPayments = payments.filter(
        (payment) => payment.recoveryStatus === "SUCCESS"
    ).length;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">

            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
            />



            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Payments
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Monitor payments, AI risk analysis and revenue recovery
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">



                    <button
                        onClick={handleTestPayment}
                        disabled={paymentLoading}
                        className="cursor-pointer rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {paymentLoading
                            ? "Opening Checkout..."
                            : "Test Payment ₹499"}
                    </button>

                    <button
                     onClick={() => setShowCustomPayment(true)}
                     className="cursor-pointer rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            >
                          Custom Payment
                    </button>

 

                    <button
                        onClick={fetchPayments}
                        disabled={loading}
                        className="cursor-pointer rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>



            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Payments
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {totalPayments}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Successful
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {successfulPayments}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Failed
                    </p>

                    <p className="mt-2 text-3xl font-bold text-red-600">
                        {failedPayments}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Recovered
                    </p>

                    <p className="mt-2 text-3xl font-bold text-emerald-600">
                        {recoveredPayments}
                    </p>
                </div>
            </div>



            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Search
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Payment ID, Order ID, email..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                  

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Status
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value="all">
                                All Statuses
                            </option>

                            <option value="captured">
                                Captured
                            </option>

                            <option value="authorized">
                                Authorized
                            </option>

                            <option value="failed">
                                Failed
                            </option>

                            <option value="refunded">
                                Refunded
                            </option>
                        </select>
                    </div>

                

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Risk Level
                        </label>

                        <select
                            value={riskFilter}
                            onChange={(e) =>
                                setRiskFilter(e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value="all">
                                All Risk Levels
                            </option>

                            <option value="LOW">
                                Low
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="HIGH">
                                High
                            </option>
                        </select>
                    </div>
                </div>
            </div>


            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1100px] text-left">

                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Payment
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Amount
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Method
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Risk
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Recovery
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        Loading payments...
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center"
                                    >
                                        <p className="text-lg font-medium text-gray-700">
                                            No payments found
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Try changing your filters or create
                                            a test payment.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr
                                        key={payment._id}
                                        className="transition hover:bg-gray-50"
                                    >
                                   

                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {payment.razorpayPaymentId}
                                                </p>

                                                {payment.razorpayOrderId && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Order:{" "}
                                                        {
                                                            payment.razorpayOrderId
                                                        }
                                                    </p>
                                                )}

                                                {payment.email && (
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {payment.email}
                                                    </p>
                                                )}
                                            </div>
                                        </td>


                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {formatAmount(
                                                payment.amount,
                                                payment.currency
                                            )}
                                        </td>


                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                    payment.status
                                                )}`}
                                            >
                                                {payment.status || "UNKNOWN"}
                                            </span>
                                        </td>

         

                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {payment.method || "-"}
                                        </td>


                                        <td className="px-6 py-4">

                                            {payment.riskLevel ? (
                                                <div>
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRiskClass(
                                                            payment.riskLevel
                                                        )}`}
                                                    >
                                                        {payment.riskLevel}
                                                    </span>

                                                    {typeof payment.riskScore ===
                                                        "number" && (
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            Score:{" "}
                                                            {
                                                                payment.riskScore
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>

             

                                        <td className="px-6 py-4">

                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRecoveryClass(
                                                    payment.recoveryStatus
                                                )}`}
                                            >
                                                {payment.recoveryStatus ||
                                                    "NOT_STARTED"}
                                            </span>

                                            {typeof payment.recoveryProbability ===
                                                "number" && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Probability:{" "}
                                                    {
                                                        payment.recoveryProbability
                                                    }
                                                    %
                                                </p>
                                            )}
                                        </td>



                                        <td className="px-6 py-4">

                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/Payments/${payment.razorpayPaymentId}`
                                                    )
                                                }
                                                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <p>
                    Showing {filteredPayments.length} of{" "}
                    {payments.length} payments
                </p>
            </div>
            {showCustomPayment && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Create Custom Payment
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Enter customer and payment details
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowCustomPayment(false)}
                    className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-4">


                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Customer Name
                    </label>

                    <input
                        type="text"
                        value={customPayment.name}
                        onChange={(e) =>
                            setCustomPayment({
                                ...customPayment,
                                name: e.target.value,
                            })
                        }
                        placeholder="Enter Your Name"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                    />
                </div>

          
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email
                    </label>

                    <input
                        type="email"
                        value={customPayment.email}
                        onChange={(e) =>
                            setCustomPayment({
                                ...customPayment,
                                email: e.target.value,
                            })
                        }
                        placeholder="Enter Your Email"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                    />
                </div>

            
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Contact
                    </label>

                    <input
                        type="tel"
                        value={customPayment.contact}
                        onChange={(e) =>
                            setCustomPayment({
                                ...customPayment,
                                contact: e.target.value,
                            })
                        }
                        placeholder="Phone"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Amount
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={customPayment.amount}
                            onChange={(e) =>
                                setCustomPayment({
                                    ...customPayment,
                                    amount: e.target.value,
                                })
                            }
                            placeholder=""
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Currency
                        </label>

                        <select
                            value={customPayment.currency}
                            onChange={(e) =>
                                setCustomPayment({
                                    ...customPayment,
                                    currency: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>

                </div>

               
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Description
                    </label>

                    <input
                        type="text"
                        value={customPayment.description}
                        onChange={(e) =>
                            setCustomPayment({
                                ...customPayment,
                                description: e.target.value,
                            })
                        }
                        placeholder="Description"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                    />
                </div>

            </div>

          
            <div className="mt-6 flex justify-end gap-3">

                <button
                    type="button"
                    onClick={() => setShowCustomPayment(false)}
                    className="cursor-pointer rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleCustomPayment}
                    disabled={paymentLoading}
                    className="cursor-pointer rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {paymentLoading
                        ? "Opening Checkout..."
                        : "Create Payment"}
                </button>

            </div>

        </div>
    </div>
)}
        </div>
    );
}