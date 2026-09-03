"use client";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {useRouter} from "next/navigation";
import { useEffect, useState } from "react";

type DashboardData = {
    success: boolean;
    stats: {
        totalPayments: number;
        failedPayments: number;
        successfulPayments: number;
        recoveryRate: number;
        revenueAtRisk: number;
        revenueRecovered: number;
        recoveredPayments: number;
        totalAIAnalysis: number;
        riskDistribution: {
            LOW: number;
            MEDIUM: number;
            HIGH: number;
        };
        recoveryActions: {
            total: number;
            executed: number;
            pending: number;
            failed: number;
            skipped: number;
        };
    };
    actionDistribution: {
        _id: string;
        count: number;
    }[];
    recentPayments: {
        _id: string;
        razorpayPaymentId: string;
        razorpayOrderId?: string;
        recoveryOrderId?: string;
        recoveryPaymentId?: string;
        recoveryStatus?: "NOT_STARTED" | "PENDING" | "SUCCESS" | "FAILED";
        recoveredAt?: string;
        amount?: number;
        currency?: string;
        status?: string;
        method?: string;
        errorCode?: string;
        ErrorDescription?: string;
        riskLevel?: string;
        recoveryProbability?: number;
        aiAction?: string;
        aiReason?: string;
        createdAtRazorPay?: number;
    }[];
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const router = useRouter();



    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/dashboard");

            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data");
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || "Failed to load dashboard");
            }

            setData(result);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("Unable to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
         return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Payment Recovery Dashboard
                    </h1>

                    <p className="mt-6 text-gray-500">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Payment Recovery Dashboard
                    </h1>

                    <div className="mt-6 rounded-xl bg-white p-6 shadow">
                        <p className="text-red-500">
                            {error || "Something went wrong"}
                        </p>

                        <button
                            onClick={fetchDashboard}
                            className="mt-4 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { stats, recentPayments, actionDistribution } = data;

     const riskData = [
    {
        name: "LOW",
        value: stats.riskDistribution.LOW,
    },
    {
        name: "MEDIUM",
        value: stats.riskDistribution.MEDIUM,
    },
    {
        name: "HIGH",
        value: stats.riskDistribution.HIGH,
    },
];

    const formatAction = (action: string) => {
        return action
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const getActionPercentage = (count: number) => {
        if (stats.recoveryActions.total === 0) {
            return 0;
        }

        return Math.round(
            (count / stats.recoveryActions.total) * 100
        );
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

        const getRecoveryClass = (status?: string) => {
        switch (status) {
            case "SUCCESS":
                return "bg-green-100 text-green-700";

            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            case "FAILED":
                return "bg-red-100 text-red-700";

            case "NOT_STARTED":
                return "bg-gray-100 text-gray-600";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const formatRecoveryStatus = (status?: string) => {
        if (!status) {
            return "Not Started";
        }

        return status
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    };

    const getStatusClass = (status?: string) => {
        switch (status) {
            case "EXECUTED":
                return "bg-green-100 text-green-700";

            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            case "FAILED":
                return "bg-red-100 text-red-700";

            case "SKIPPED":
                return "bg-gray-100 text-gray-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-7xl">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Payment Recovery Dashboard
                        </h1>

                        <p className="mt-2 text-gray-600">
                            AI-powered payment revenue recovery
                        </p>
                    </div>

                    <button
                        onClick={fetchDashboard}
                        className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                </div>

<div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h2 className="text-xl font-semibold text-gray-900">
                AI Recovery Performance
            </h2>

            <p className="mt-1 text-sm text-gray-500">
                Business impact generated by AI-powered payment recovery
            </p>
        </div>

        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            AI Impact
        </div>
    </div>

    {/* AI IMPACT CARDS */}
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Payments Analyzed */}
        <div className="rounded-xl border bg-gray-50 p-5">
            <p className="text-sm text-gray-500">
                Payments Analyzed
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalAIAnalysis.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-gray-500">
                Payments evaluated by AI
            </p>
        </div>

        {/* High Risk */}
        <div className="rounded-xl border bg-red-50 p-5">
            <p className="text-sm text-gray-500">
                High Risk Payments
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
                {stats.riskDistribution.HIGH.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-gray-500">
                Payments requiring attention
            </p>
        </div>

        {/* Recovery Actions */}
        <div className="rounded-xl border bg-blue-50 p-5">
            <p className="text-sm text-gray-500">
                Recovery Actions
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
                {stats.recoveryActions.total.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-gray-500">
                Actions triggered by AI
            </p>
        </div>

        {/* Recovery Attempts */}
        <div className="rounded-xl border bg-purple-50 p-5">
            <p className="text-sm text-gray-500">
                Recovery Attempts
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
                {stats.recoveryActions.executed.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-gray-500">
                Actions successfully executed
            </p>
        </div>

      
        <div className="rounded-xl border bg-green-50 p-5">
            <p className="text-sm text-gray-500">
                Recovered Revenue
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
                ₹{(stats.revenueRecovered / 100).toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-gray-500">
                Revenue recovered through recovery flow
            </p>
        </div>

      
        <div className="rounded-xl border bg-indigo-50 p-5">
            <p className="text-sm text-gray-500">
                Recovery Rate
            </p>

            <p className="mt-2 text-3xl font-bold text-indigo-600">
                {stats.recoveryRate}%
            </p>

            <p className="mt-1 text-xs text-gray-500">
                Successful recovery percentage
            </p>
        </div>

    </div>

    <div className="mt-8">

        <h3 className="text-lg font-semibold text-gray-900">
            AI Recovery Funnel
        </h3>

        <p className="mt-1 text-sm text-gray-500">
            How AI converts failed payments into recovered revenue
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-7 md:items-center">

         
            <div className="rounded-xl border bg-red-50 p-4 text-center md:col-span-1">
                <p className="text-xs font-medium text-gray-500">
                    Failed Payments
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                    {stats.failedPayments}
                </p>
            </div>

            <div className="hidden text-center text-xl text-gray-400 md:block">
                →
            </div>

       
            <div className="rounded-xl border bg-blue-50 p-4 text-center md:col-span-1">
                <p className="text-xs font-medium text-gray-500">
                    AI Analyzed
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-600">
                    {stats.totalAIAnalysis}
                </p>
            </div>

            <div className="hidden text-center text-xl text-gray-400 md:block">
                →
            </div>

          
            <div className="rounded-xl border bg-purple-50 p-4 text-center md:col-span-1">
                <p className="text-xs font-medium text-gray-500">
                    Recovery Attempted
                </p>

                <p className="mt-2 text-2xl font-bold text-purple-600">
                    {stats.recoveryActions.executed}
                </p>
            </div>

            <div className="hidden text-center text-xl text-gray-400 md:block">
                →
            </div>

          
            <div className="rounded-xl border bg-green-50 p-4 text-center md:col-span-1">
                <p className="text-xs font-medium text-gray-500">
                    Recovered
                </p>

                <p className="mt-2 text-2xl font-bold text-green-600">
                    {stats.recoveredPayments}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    ₹{(stats.revenueRecovered / 100).toFixed(2)}
                </p>
            </div>

        </div>
    </div>

</div>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">

                    <div onClick={() => router.push("/Payments")}
                     className="cursor-pointer rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Payments
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-gray-900">
                            {stats.totalPayments.toLocaleString()}
                        </h2>
                    </div>

                    <div onClick={() => router.push("/Payments?status=failed")}
                     className="cursor-pointer rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Failed Payments
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-red-600">
                            {stats.failedPayments.toLocaleString()}
                        </h2>
                    </div>

                    <div onClick={() => router.push("/Payments?status=captured")}
                     className="cursor-pointer rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Successful Payments
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-green-600">
                            {stats.successfulPayments.toLocaleString()}
                        </h2>
                    </div>

                     <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Recovered Payments
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-green-600">
                            {stats.recoveredPayments.toLocaleString()}
                        </h2>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Recovery Rate
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-blue-600">
                            {stats.recoveryRate}%
                        </h2>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Revenue at Risk
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-orange-600">
                            ₹{(stats.revenueAtRisk / 100).toFixed(2)}
                        </h2>
                    </div>

                     <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Revenue Recovered
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-green-600">
                            ₹{(stats.revenueRecovered / 100).toFixed(2)}
                        </h2>
                    </div>

                     <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            AI Analysis
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-green-600">
                            ₹{(stats.totalAIAnalysis.toLocaleString)()}
                        </h2>
                    </div>

                    
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

<div className="rounded-xl bg-white p-6 shadow-sm">

    <div className="flex items-center justify-between">
        <div>
            <h2 className="text-xl font-semibold text-gray-900">
                AI Risk Distribution
            </h2>

            <p className="mt-1 text-sm text-gray-500">
                Risk classification of failed payments
            </p>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
            {stats.totalAIAnalysis} analyses
        </span>
    </div>

    <div className="mt-6 h-[300px] w-full">

        {stats.totalAIAnalysis === 0 ? (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-500">
                    No AI risk data available.
                </p>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                    <Pie
                        data={riskData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={55}
                        paddingAngle={3}
                        label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                    >

                        <Cell fill="#22c55e" />
                        <Cell fill="#eab308" />
                        <Cell fill="#ef4444" />

                    </Pie>

                    <Tooltip />

                    <Legend
                        verticalAlign="bottom"
                        height={36}
                    />

                </PieChart>
            </ResponsiveContainer>
        )}

    </div>

    <div className="mt-4 grid grid-cols-3 gap-3">

        <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-xs text-gray-500">
                LOW
            </p>

            <p className="mt-1 text-xl font-bold text-green-600">
                {stats.riskDistribution.LOW}
            </p>
        </div>

        <div className="rounded-lg bg-yellow-50 p-3 text-center">
            <p className="text-xs text-gray-500">
                MEDIUM
            </p>

            <p className="mt-1 text-xl font-bold text-yellow-600">
                {stats.riskDistribution.MEDIUM}
            </p>
        </div>

        <div className="rounded-lg bg-red-50 p-3 text-center">
            <p className="text-xs text-gray-500">
                HIGH
            </p>

            <p className="mt-1 text-xl font-bold text-red-600">
                {stats.riskDistribution.HIGH}
            </p>
        </div>

    </div>

</div>


                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        <h2 className="text-xl font-semibold text-gray-900">
                            Recovery Actions
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Current recovery engine activity
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-4">

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Total
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {stats.recoveryActions.total}
                                </p>
                            </div>

                            <div className="rounded-lg bg-green-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Executed
                                </p>

                                <p className="mt-1 text-2xl font-bold text-green-600">
                                    {stats.recoveryActions.executed}
                                </p>
                            </div>

                            <div className="rounded-lg bg-yellow-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Pending
                                </p>

                                <p className="mt-1 text-2xl font-bold text-yellow-600">
                                    {stats.recoveryActions.pending}
                                </p>
                            </div>

                            <div className="rounded-lg bg-red-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Failed
                                </p>

                                <p className="mt-1 text-2xl font-bold text-red-600">
                                    {stats.recoveryActions.failed}
                                </p>
                            </div>

                        </div>

                        <div className="mt-4 rounded-lg bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Skipped Actions
                                </p>

                                <p className="font-bold text-gray-700">
                                    {stats.recoveryActions.skipped}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>


                <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Recovery Action Distribution
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            AI recommended recovery strategies
                        </p>
                    </div>

                    {actionDistribution.length === 0 ? (
                        <p className="mt-8 py-6 text-center text-gray-500">
                            No recovery actions found.
                        </p>
                    ) : (
                        <div className="mt-6 space-y-5">

                            {actionDistribution.map((item) => {

                                const percentage =
                                    getActionPercentage(item.count);

                                return (
                                    <div key={item._id}>

                                        <div className="mb-2 flex items-center justify-between">

                                            <span className="text-sm font-medium text-gray-700">
                                                {formatAction(item._id)}
                                            </span>

                                            <span className="text-sm text-gray-500">
                                                {item.count} (
                                                {percentage}
                                                %)
                                            </span>

                                        </div>

                                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                                            <div
                                                className="h-full rounded-full bg-black transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />

                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    )}
                </div>


                <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Recent Failed Payments
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Latest failed and recovered transactions analyzed by AI
                            </p>
                        </div>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                            {recentPayments.length} records
                        </span>

                    </div>

                    <div className="mt-6 overflow-x-auto">

                        {recentPayments.length === 0 ? (
                            <p className="py-8 text-center text-gray-500">
                                No failed payments found.
                            </p>
                        ) : (
                            <table className="w-full text-left">

                                <thead>
                                    <tr className="border-b text-sm text-gray-500">

                                        <th className="px-4 py-3">
                                            Payment ID
                                        </th>

                                        <th className="px-4 py-3">
                                            Amount
                                        </th>

                                        <th className="px-4 py-3">
                                            Method
                                        </th>

                                        <th className="px-4 py-3">
                                            Risk
                                        </th>

                                        <th className="px-4 py-3">
                                            Recovery
                                        </th>

                                        <th className="px-4 py-3">
                                            Action
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {recentPayments.map((payment) => (

                                        <tr
                                            key={payment._id}
                                            className="border-b last:border-0 hover:bg-gray-50"
                                        >


                                            <td className="px-4 py-4 font-medium text-gray-900">
                                                {payment.razorpayPaymentId}
                                            </td>

                                         
                                            <td className="px-4 py-4">
                                                {payment.currency || "INR"}{" "}
                                                {payment.amount
                                                    ? (
                                                        payment.amount / 100
                                                    ).toFixed(2)
                                                    : "0.00"}
                                            </td>

              
                                            <td className="px-4 py-4 capitalize">
                                                {payment.method || "-"}
                                            </td>

                                           
                                            <td className="px-4 py-4">

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${getRiskClass(
                                                        payment.riskLevel
                                                    )}`}
                                                >
                                                    {payment.riskLevel ||
                                                        "N/A"}
                                                </span>

                                            </td>

                                            <td className="px-4 py-4">

                                                {payment.recoveryProbability !==
                                                undefined
                                                    ? `${Math.round(
                                                        payment.recoveryProbability *
                                                            100
                                                    )}%`
                                                    : "0%"}

                                            </td>

                                     
                                            <td className="px-4 py-4">

                                                {payment.aiAction ? (
                                                    <button onClick={() =>
                                                        router.push(`/Payments/${payment._id}`)
                                                    }
                                                    className="cursor-pointer rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-200"
                                                    >

                                                  
                                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                                        {formatAction(
                                                            payment.aiAction
                                                        )}
                                                        
                                                    </span>
                                                      </button>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        N/A
                                                    </span>
                                                )}

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                        )}

                    </div>
                </div>


                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        <p className="text-sm text-gray-500">
                            AI Analysis Coverage
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats.failedPayments > 0
                                ? Math.round(
                                      (stats.totalAIAnalysis /
                                          stats.failedPayments) *
                                          100
                                  )
                                : 0}
                            %
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Failed payments analyzed by AI
                        </p>

                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Action Execution Rate
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats.recoveryActions.total > 0
                                ? Math.round(
                                      (stats.recoveryActions.executed /
                                          stats.recoveryActions.total) *
                                          100
                                  )
                                : 0}
                            %
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Recovery actions successfully executed
                        </p>

                    </div>

                  
                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Failed Action Rate
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-600">
                            {stats.recoveryActions.total > 0
                                ? Math.round(
                                      (stats.recoveryActions.failed /
                                          stats.recoveryActions.total) *
                                          100
                                  )
                                : 0}
                            %
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Recovery actions that failed
                        </p>

                    </div>

               <div className="rounded-xl bg-white p-6 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Revenue Recovery
                        </p>

                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {stats.revenueAtRisk > 0
                                ? Math.round(
                                      (stats.revenueRecovered /
                                          (stats.revenueRecovered +
                                              stats.revenueAtRisk)) *
                                          100
                                  )
                                : stats.revenueRecovered > 0
                                ? 100
                                : 0}
                            %
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Revenue successfully recovered
                        </p>

                    </div>
                </div>

            </div>
        </div>
    );
}