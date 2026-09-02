import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PaymentSchema from "@/app/models/PaymentSchema";
import RecoveryAction from "@/app/models/RecoveryAction";
import { razorpay } from "@/lib/Razorpay/razorpay";
import crypto from "crypto";


export async function POST(req: NextRequest) {
    try{
        await dbConnect();

        const body = await req.json();
        const {paymentId} = body;

        if(!paymentId) {
            return NextResponse.json({
                success: false,
                message: "Payment Id is required",
            }, {status: 400});
        }
        const payment = await PaymentSchema.findOne({
            razorpayPaymentId: paymentId,
        });
        if(!payment) {
            return NextResponse.json({
                success: false,
                message: "Payment not found",
            }, {status: 404});
        }

        if (payment.status !== "failed") {
            return NextResponse.json({
                success: false,
                message: "This Payment does not require recovery",
            }, {status: 400});
        }

        if(!payment.amount || payment.amount<= 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid payment amount",
            }, {status: 400});
        }
        const currency = payment.currency || "INR";

        const order = await razorpay.orders.create({
            amount: payment.amouont,
            currency,
            receipt: `recovery_${payment.razorpayPaymentId}`,
            notes: {
                recoveryForPayment: payment.razorpayPaymentId,
                originalOrderId: payment.razorpayOrderId || "",
                recovery: "true",
            },
        });

        await PaymentSchema.updateOne(
    {
        razorpayPaymentId: paymentId,
    },
    {
        $set: {
            recoveryOrderId: order.id,
            recoveryStatus: "PENDING",
        },
    }
);

        await RecoveryAction.create({
            paymentId: payment.razorpayPaymentId,
            orderId: order.id,
            action: "RETRY",
            status: "PENDING",
            message: "Recovery payment order created"
        });

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },

            payment: {
                paymentId: payment.razorpayPaymentId,
                originalOrderId: payment.razorpayOrderId,
                email: payment.email,
                amount: payment.amount,
                currency,
            },

            key: process.env.RAZORPAY_KEY_ID
        }, {status: 200});
    } catch(error) {
        console.error("Recovery order creation error: ", error);

        return NextResponse.json({
            success: false,
            message: "Failed to create recivery order",
        },
        {status: 500}
        );
    }
}


export async function PUT(req: NextRequest) {
    try{
        await dbConnect();

        const body = await req.json();

        const {
            paymentId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = body;

        if(
            !paymentId ||
            !razorpayPaymentId || 
            !razorpayOrderId ||
            !razorpaySignature
        ) {
            return NextResponse.json({
                success: false,
                message: "Payment verification fields are required "
            }, {status: 400});
        }

        const originalPayment = await PaymentSchema.findOne({
            razorpayPaymentId: paymentId,
        });

        if(!originalPayment) {
            return NextResponse.json({
                success: false,
                message: "Original Payment not found",
            }, {status: 404});
        }
          const secret = process.env.RAZORPAY_KEY_SECRET;

        if (!secret) {
            throw new Error("Razorpay secret key is missing");
        }

        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (generatedSignature !== razorpaySignature) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Razorpay payment signature",
                },
                { status: 400 }
            );
        }
        originalPayment.recoveryOrderId = razorpayOrderId;
        originalPayment.recoveryPaymentId = razorpayPaymentId;

       originalPayment.recoveryStatus = "SUCCESS";
       originalPayment.recoveredAt = new Date();

       originalPayment.status = "recovered";

      await originalPayment.save();

 const recoveryAction = await RecoveryAction.findOne({
            paymentId,
            orderId: razorpayOrderId,
            action: "RETRY",
            status: "PENDING",
        }).sort({
            createdAt: -1,
        });

        if (recoveryAction) {
            recoveryAction.status = "EXECUTED";
            recoveryAction.executedAt = new Date();
            recoveryAction.message = "Recovery payment successful";

            await recoveryAction.save();
        }

        return NextResponse.json(
            {
                success: true,
                message: "Recovery payment verified successfully",
                paymentId: razorpayPaymentId,
                orderId: razorpayOrderId,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Recovery verification error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to verify recovery payment",
            },
            { status: 500 }
        );
    }
}