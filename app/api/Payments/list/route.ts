import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PaymentSchema from "@/app/models/PaymentSchema";

export async function GET(){
    try{
        await dbConnect();
        const payments = await PaymentSchema.find({})
        .sort({_id: -1})
        .lean();

        return NextResponse.json({
            success: true,
            count: payments.length,
            payments,
        });
    } catch(error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error fetching payments",
            },
            { status: 500 }
        );
    }
}