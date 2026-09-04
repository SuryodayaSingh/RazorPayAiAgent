import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/Razorpay/razorpay";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { amount, currency = "INR", receipt, customer, description = "Payment" } = body;

        if (
            amount === undefined ||
            amount === null ||
            Number(amount) <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid Amount is required",
                },
                { status: 400 }
            );
        }

         if (customer) {
            if (!customer.name?.trim()) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Customer name is required",
                    },
                    { status: 400 }
                );
            }

            if (!customer.email?.trim()) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Customer email is required",
                    },
                    { status: 400 }
                );
            }

            if (!customer.contact?.trim()) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Customer contact is required",
                    },
                    { status: 400 }
                );
            }
        }

         const amountInPaise = Math.round(Number(amount) * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
             notes: {
                project: "AI Revenue Recovery",

                description,

                ...(customer && {
                    customer_name: customer.name,
                    customer_email: customer.email,
                    customer_contact: customer.contact,
                }),
            },
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