import { NextRequest, NextResponse } from "next/server";
import { sendRecoveryEmail } from "@/lib/sendRecoveryEmail";


export async function POST(req: NextRequest) {
    try{
        const boody = await req.json();

        const {email} = boody;
        if(!email) {
            return NextResponse.json({
                success: false,
                message: "Email is required",
            }, {status:400});
        }

        await sendRecoveryEmail(
            email, 
            "This is a test recovery email from your Razorpay Revenue Recovery AI project."
        );

        return NextResponse.json({
            success: true,
            message: "Test recovery email sent succcessfully",
        });

    }catch(error) {
        console.error("Test EmailError:", error);

          return NextResponse.json({
            success: false,
            message: "Failed to send test email",
            error: error instanceof Error ? error.message : "Unknown Error",
        }, {status:500});
    }

      
    }
