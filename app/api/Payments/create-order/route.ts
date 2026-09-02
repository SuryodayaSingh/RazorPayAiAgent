import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/Razorpay/razorpay";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { amount, currency = "INR", receipt } = body;

        if (!amount) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Amount is required",
                },
                { status: 400 }
            );
        }
         const amountInPaise = Math.round(Number(amount) * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        });

        console.log("Razorpay Order Created:", order);

        return NextResponse.json(
            {
                success: true,
                message: "Razorpay order created successfully",
                order,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error(
            "Create Razorpay Order Error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create Razorpay order",
            },
            { status: 500 }
        );
    }
}