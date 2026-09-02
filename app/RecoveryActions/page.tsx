"use client";

import { useEffect, useState } from "react";

interface RecoveryAction {
    _id: string;
    paymentId: string;
    orderId?: string;
    action: string;
    status: string;
    message?: string;
    executedAt?: string;
    createdAt: string;
}

export default function RecoveryActionsPage() {
    const [actions, setActions] = useState<RecoveryAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActions = async () => {
            try {
                const response = await fetch("/api/RecoveryActions");

                if (!response.ok) {
                    throw new Error("Failed to fetch recovery actions");
                }

                const data = await response.json();

                setActions(data.recoveryActions || []);
            } catch (error) {
                console.error("Recovery Actions Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActions();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                Loading recovery actions...
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Recovery Actions
            </h1>

            {actions.length === 0 ? (
                <p>No recovery actions found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3 text-left">Payment ID</th>
                                <th className="p-3 text-left">Action</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Message</th>
                                <th className="p-3 text-left">Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {actions.map((item) => (
                                <tr
                                    key={item._id}
                                    className="border-b"
                                >
                                    <td className="p-3">
                                        {item.paymentId}
                                    </td>

                                    <td className="p-3">
                                        {item.action}
                                    </td>

                                    <td className="p-3">
                                        {item.status}
                                    </td>

                                    <td className="p-3">
                                        {item.message || "-"}
                                    </td>

                                    <td className="p-3">
                                        {new Date(
                                            item.createdAt
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}