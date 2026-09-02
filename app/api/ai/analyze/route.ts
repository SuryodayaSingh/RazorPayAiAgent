import {NextRequest, NextResponse} from "next/server";
import { executeRecoveryAction } from "@/lib/recoveryEngine";
import dbConnect from "@/lib/dbConnect";
import {
    analyzePayment,
    PaymentData,
} from "@/lib/aiAgent";
import AIAnalysis from "@/app/models/AIAnalysis";
import { razorpay } from "@/lib/Razorpay/razorpay";

export async function POST(req: NextRequest) {
    try{
        console.log("AI Anqalysis Start");

        const rawBody = await req.text();
        console.log("RAW Body", rawBody);
        if (!rawBody || rawBody.trim() === "")
             { return NextResponse.json( { 
                success: false,
                 message: "Request body is empty", },
                  { status: 400 } );
                 }

                 let body: PaymentData;
                 try{
                    body = JSON.parse(rawBody) as PaymentData;
                 } catch(error) {
                    console.error("Request JSON Error", error);
                    return NextResponse.json( { 
                        success: false,
                         message: "Invalid JSON request body",
                         },
                         { status: 400 } ); 
                        }
                            console.log("BODY RECEIVED", body);
                            if (!body.paymentId) {
                                return NextResponse.json( {
                                     success: false,
                                      message: "paymentId is required",
                                     },
                                     { status: 400 } );
                            }
                             await dbConnect();
                              const aiResult = await analyzePayment(body);
        console.log("AI Result", aiResult);

        const analysis = await AIAnalysis.create({
            paymentId: body.paymentId,
            orderId: body.orderId,
            riskLevel: aiResult.riskLevel,
            recoveryProbability: aiResult.recoveryProbability,
            recommendedAction: aiResult.recommendedAction,
            reason: aiResult.reason,
            message: aiResult.message,
            rawResponse: aiResult,
        });
        console.log("AI Analysis saved successfully");

        return NextResponse.json({
            success: true,

            analysis: {
                id: analysis._id,
                paymentId: analysis.paymentId,
                riskLevel: analysis.riskLevel,
                recoveryProbability: analysis.recoveryProbability,

                recommendedAction: analysis.recommendedAction,
                reason: analysis.reason,
                message: analysis.message,
            },
        });
    } catch(error) {
        console.error("AI Analysis Error:", error);

        return NextResponse.json({
            success: false,
            message: "AI analysis failed",
        }, {
            status: 500,
        }
        );
    }
}
                 


              


       

       