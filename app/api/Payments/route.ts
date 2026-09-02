import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import dbConnect from "@/lib/dbConnect";
import PaymentSchema from "@/app/models/PaymentSchema";
import AIAnalysis from "@/app/models/AIAnalysis";
import { analyzePayment } from "@/lib/aiAgent";
import { executeRecoveryAction } from "@/lib/recoveryEngine";
import { razorpay } from "@/lib/Razorpay/razorpay";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();

        const {
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            customerId,
            customer,
        } = body;

        // ----------------------------------------
        // 1. VALIDATE REQUIRED FIELDS
        // ----------------------------------------

        if (
            !razorpayPaymentId ||
            !razorpayOrderId ||
            !razorpaySignature
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Razorpay payment ID, order ID and signature are required",
                },
                { status: 400 }
            );
        }

        // ----------------------------------------
        // 2. VERIFY RAZORPAY SIGNATURE
        // ----------------------------------------

        const secret = process.env.RAZORPAY_KEY_SECRET;

        if (!secret) {
            console.error(
                "RAZORPAY_KEY_SECRET is missing"
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Razorpay secret key is not configured",
                },
                { status: 500 }
            );
        }

        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(
                `${razorpayOrderId}|${razorpayPaymentId}`
            )
            .digest("hex");

        const signaturesMatch =
            generatedSignature === razorpaySignature;

        if (!signaturesMatch) {
            console.error("Invalid Razorpay signature");

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Razorpay payment signature",
                },
                { status: 400 }
            );
        }

        console.log(
            "Razorpay signature verified successfully"
        );

        // ----------------------------------------
        // 3. FETCH PAYMENT FROM RAZORPAY
        // ----------------------------------------

        let razorpayPayment;

        try {
            razorpayPayment =
                await razorpay.payments.fetch(
                    razorpayPaymentId
                );
        } catch (error) {
            console.error(
                "Razorpay payment fetch error:",
                error
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Unable to verify payment with Razorpay",
                },
                { status: 400 }
            );
        }

        // ----------------------------------------
        // 4. VERIFY ORDER ID
        // ----------------------------------------

        if (
            razorpayPayment.order_id &&
            razorpayPayment.order_id !== razorpayOrderId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Payment does not belong to this order",
                },
                { status: 400 }
            );
        }

        // ----------------------------------------
        // 5. CHECK DUPLICATE PAYMENT
        // ----------------------------------------

        const existingPayment =
            await PaymentSchema.findOne({
                razorpayPaymentId,
            });

        if (existingPayment) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Payment already exists",
                    payment: existingPayment,
                },
                { status: 200 }
            );
        }

        // ----------------------------------------
        // 6. GET VERIFIED PAYMENT DATA
        // ----------------------------------------

        const verifiedAmount =
            razorpayPayment.amount;

        const verifiedCurrency =
            razorpayPayment.currency || "INR";

        const verifiedStatus =
            razorpayPayment.status;

        const verifiedMethod =
            razorpayPayment.method;

        const verifiedEmail =
            razorpayPayment.email ||
            customer?.email;

        const verifiedContact =
            razorpayPayment.contact ||
            customer?.contact;

        const failureReason =
            razorpayPayment.error_description;



        const payment = await PaymentSchema.create({
            razorpayPaymentId,

            razorpayOrderId,

            amount: verifiedAmount,

            currency: verifiedCurrency,

            status: verifiedStatus,

            method: verifiedMethod,

            email: verifiedEmail,

            contact: verifiedContact,

            failureReason,

            ErrorDescription: failureReason,

            customer,

            recoveryStatus: "NOT_STARTED",

            createdAtRazorPay:
                razorpayPayment.created_at
                    ? razorpayPayment.created_at
                      
                    : Math.floor(Date.now() /1000),
        });

        console.log(
            "Payment saved successfully:",
            payment.razorpayPaymentId
        );

        // ----------------------------------------
        // 8. AI ANALYSIS FOR FAILED PAYMENT
        // ----------------------------------------

        let aiAnalysis = null;
        let recoveryAction = null;

        if (verifiedStatus === "failed") {
            try {
                const aiResult = await analyzePayment({
                      paymentId: payment.razorpayPaymentId,
                        orderId: payment.razorpayOrderId,
                         amount: Number(verifiedAmount),
                       currency: verifiedCurrency,
                      status: verifiedStatus,
                         method: verifiedMethod,
                         failureReason: failureReason
                         ? String(failureReason) : undefined,
                         customer: {
                       email: verifiedEmail,
                         },
                        });

                aiAnalysis =
                    await AIAnalysis.create({
                        paymentId: payment._id,

                        riskLevel:
                            aiResult.riskLevel,

                        recoveryProbability:
                            aiResult.recoveryProbability,

                        recommendedAction:
                            aiResult.recommendedAction,

                        reason:
                            aiResult.reason,
                            message: aiResult.message,
                    });

                await PaymentSchema.findByIdAndUpdate(
                    payment._id,
                    {
                        riskLevel:
                            aiResult.riskLevel,

                        recoveryProbability:
                            aiResult.recoveryProbability,

                        aiAction:
                            aiResult.recommendedAction,

                        aiReason:
                            aiResult.reason,
                    }
                );


                       recoveryAction = await executeRecoveryAction(
                      payment.razorpayPaymentId,
                    payment.razorpayOrderId,
                    aiResult,
                     verifiedEmail,
    {
        amount: Number(verifiedAmount),
        currency: verifiedCurrency,
        failureReason: failureReason
        ? String(failureReason) : undefined,
    }
);

                console.log(
                    "Recovery action executed successfully"
                );
            } catch (error) {
                console.error(
                    "AI / Recovery Error:",
                    error
                );
            }
        }

        return NextResponse.json(
            {
                success: true,
                message:
                    "Payment verified and saved successfully",

                payment,

                aiAnalysis,

                recoveryAction,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "Payment verification error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Payment verification failed",
            },
            { status: 500 }
        );
    }
}