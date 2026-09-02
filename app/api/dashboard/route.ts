import {NextResponse} from "next/server";
import dbConnect from "@/lib/dbConnect";
import PaymentSchema from "@/app/models/PaymentSchema";
import AIAnalysis from "@/app/models/AIAnalysis";
import RecoveryAction from "@/app/models/RecoveryAction";

export async function GET() {
    try{
        await dbConnect();
        const totalPayments = await PaymentSchema.countDocuments();
        const failedPayments = await PaymentSchema.countDocuments({
            status: "failed"
        });

        const successfulPayments = await PaymentSchema.countDocuments({
            status: "captured"
        });

         const recoveredPayments = await PaymentSchema.countDocuments({
            recoveryStatus: "SUCCESS",
        });

        const revenueAtRiskResult = await PaymentSchema.aggregate([
            {
                $match: {
                    status: "failed",
                    recoveryStatus: {
                        $ne: "SUCCESS",
                    },
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
        ]);

          const revenueAtRisk= revenueAtRiskResult.length >0
        ? revenueAtRiskResult[0].total : 0;

        const revenueRecoveredResult = await PaymentSchema.aggregate([
            {
                $match: {
                    recoveryStatus: "SUCCESS",
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
        ]);


        const revenueRecovered = revenueRecoveredResult.length > 0
                ? revenueRecoveredResult[0].total
                : 0;



        const totalAIAnalysis = await AIAnalysis.countDocuments();
        const lowRisk = await AIAnalysis.countDocuments({
            riskLevel: "LOW"
        });

        const mediumRisk = await AIAnalysis.countDocuments({
            riskLevel: "MEDIUM"
        });


        const highRisk = await AIAnalysis.countDocuments({
            riskLevel: "HIGH"
        });

        const totalRecoveryActions = await RecoveryAction.countDocuments();

        const executedActions = await RecoveryAction.countDocuments({
            status: "EXECUTED"
        });

        const pendingActions = await RecoveryAction.countDocuments({
            status: "PENDING"
        });

        const failedActions = await RecoveryAction.countDocuments({
            status: "FAILED"
        });

        const skippedActions = await RecoveryAction.countDocuments({
            status: "SKIPPED"
        });

        const actionStats = await RecoveryAction.aggregate([
            {
                $group:{
                    _id: "$action",
                    count: {$sum: 1}
                },
            },
            {
                $sort: {count: -1,},
            },

        ]);




        let recoveryRate = 0;
        if(failedPayments >0) {
            recoveryRate = (recoveredPayments / failedPayments) *100;
        }


        const recentPayments = await PaymentSchema.find({
            $or: [{
                   status: "failed"
            },
            {
                recoveryStatus: "SUCCESS",
            }
        ]
         
        })
        .sort({createdAt: -1})
        .limit(10)
        .select(
            [
                        "razorpayPaymentId",
                        "razorpayOrderId",
                        "recoveryOrderId",
                        "recoveryPaymentId",
                        "amount",
                        "currency",
                        "status",
                        "recoveryStatus",
                        "recoveredAt",
                        "method",
                        "email",
                        "contact",
                        "errorCode",
                        "ErrorDescription",
                        "riskScore",
                        "riskLevel",
                        "recoveryProbability",
                        "aiAction",
                        "aiReason",
                        "createdAtRazorPay",
                        "createdAt",
                    ].join(" ")
                )
        .lean();

        return NextResponse.json({
            success: true,
            stats: {
                totalPayments,
                failedPayments,
                successfulPayments,
                recoveredPayments,
                revenueAtRisk,
                revenueRecovered,
                recoveryRate: Math.round(recoveryRate * 100) / 100,
                totalAIAnalysis,
                riskDistribution: {
                    LOW: lowRisk,
                    MEDIUM: mediumRisk,
                    HIGH: highRisk
                },

                recoveryActions: {
                    total: totalRecoveryActions,
                    executed: executedActions,
                    pending: pendingActions,
                    failed: failedActions,
                    skipped: skippedActions,
            },
        },
        actionDistribution: actionStats,
        recentPayments,
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);

        return NextResponse.json({
            success: false,
            message: "Failed to fetch dashboard data",
        }, {status: 500});
    }
}
