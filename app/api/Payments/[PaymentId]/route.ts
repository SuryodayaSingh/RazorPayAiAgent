import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PaymentSchema from "@/app/models/PaymentSchema";
import AIAnalysis from "@/app/models/AIAnalysis";
import RecoveryAction from "@/app/models/RecoveryAction";


export async function GET (
    req:NextRequest, {params}: {params: Promise<{PaymentId: string}>}
) {
    try{
        await dbConnect();

        const {PaymentId} = await params;
        console.log("Payment id from params:", PaymentId);
        console.log("PARAMS", params)

        if(!PaymentId || PaymentId === "undefined") {
            return NextResponse.json({
                success: false,
                message: "Payment ID is required",
            }, {status: 400});
        }

        const payment = await PaymentSchema.findOne({
            razorpayPaymentId: PaymentId,
        }).lean();

        if(!payment) {
            return NextResponse.json({
                success: false,
                message: "Payment not found",
            }, {status: 404});
        }

        const aiAnalysis = await AIAnalysis.findOne({
            paymentId: PaymentId,
        })
        .sort({createdAt: -1})
        .lean();

        const recoveryActions = await RecoveryAction.find({
             paymentId: PaymentId
        })
        .sort({createdAt: -1})
        .lean();

        return NextResponse.json({
            success:true,
            payment,
            aiAnalysis,
            recoveryActions,
        });
    } catch(error) {
        console.error("Payment Details API Error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch payment details",
        }, {status: 500})
    }
}