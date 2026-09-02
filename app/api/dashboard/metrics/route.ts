import { NextResponse} from "next/server";
import dbConnect from "@/lib/dbConnect";
import PaymentSchema from "@/app/models/PaymentSchema";
import RecoveryAction from "@/app/models/RecoveryAction";


export async function GET() {
    try{
        await dbConnect();

        const[
            totalPayments,
            successfulPayments,
            failedPayments,
            recoveryActions,
            executedRecoveryActions,
            failedRecoveryActions,
            revenueAtRiskResult,
        ] = await Promise.all([
            PaymentSchema.countDocuments(),

            PaymentSchema.countDocuments({
                status: "captured",
            }),

              PaymentSchema.countDocuments({
                status: "failed",
            }),

            RecoveryAction.countDocuments(),
              RecoveryAction.countDocuments({
                status: "EXECUTED",
            }),

             RecoveryAction.countDocuments({
                status: "FAILED",
            }),

            PaymentSchema.aggregate([
                {
                    $match: {
                        status: "failed",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount",
                        },
                    },
                },
            ]),
        ]);

        const revenueAtRisk = revenueAtRiskResult.length>0
        ? revenueAtRiskResult[0].total :0;

        const recoveryExecutionRate = recoveryActions >0
        ? (executedRecoveryActions / recoveryActions) * 100 : 0;

        return NextResponse.json({
            success: true,
            metrics: {
                totalPayments,
                successfulPayments,
                failedPayments,
                revenueAtRisk,
                recoveryActions,
                executedRecoveryActions,
                failedRecoveryActions,

                recoveryExecutionRate: Number(
                   recoveryExecutionRate.toFixed(2)
                ),
            },
        });
    } catch(error) {
        console.error("Dashboard Metrics Error:", error);

        return NextResponse.json({
            success: false,
            message: "Failed to fetch dashboard metrics",
        }, {status: 500});
    }
}