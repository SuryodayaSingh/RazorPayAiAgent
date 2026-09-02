import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import dbConnect from "@/lib/dbConnect";
import PaymentSchema from "@/app/models/PaymentSchema";
import AIAnalysis from "@/app/models/AIAnalysis";
import { analyzePayment } from "@/lib/aiAgent";
import { executeRecoveryAction } from "@/lib/recoveryEngine";

export async function POST(req: NextRequest) {
    try{
        await dbConnect();

        const rawBody = await req.text();

        const razorpaySignature = req.headers.get("x-razorpay-signature");

        if(!razorpaySignature) {
            console.error("Razorpay webhook signature missing");

            return NextResponse.json({
                success: false,
                message: "Webhook signature missing",
            }, {status: 400});
        }

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if(!webhookSecret) {
            console.error("RAZORPAY_WEBHOOK_SECRET is missing");

            return NextResponse.json({
                success: false,
                message: "Razorpay webhook is still not configured",
            }, {status: 500});
        }
        const generatedSignature = crypto
         .createHmac("sha256", webhookSecret)
          .update(rawBody)
           .digest("hex");
            const signaturesMatch =
             generatedSignature === razorpaySignature;
              if (!signaturesMatch)
                 { console.error( "Invalid Razorpay webhook signature" );
                     return NextResponse.json( {
                         success: false,
                          message: "Invalid Razorpay webhook signature",
                         },
                          { status: 400 } );
                         }
         console.log( " Razorpay webhook signature verified" );

         const body = JSON.parse(rawBody);
          const event = body.event;
          console.log( "Razorpay webhook event:", event );

          if (event !== "payment.failed")
             { console.log( `ℹ️ Event ${event} ignored` );
           return NextResponse.json( {
             success: true,
              message: "Event ignored",
           }, { status: 200 } );
         }
         const paymentEntity =
          body.payload?.payment?.entity; 
          if (!paymentEntity) { 
            console.error( "❌ Payment entity missing from webhook" );
             return NextResponse.json( { 
                success: false, 
                message: "Payment entity missing",
             }, { status: 400 } );
             } 
             const razorpayPaymentId = paymentEntity.id;
             const razorpayOrderId = paymentEntity.order_id;
             const amount = paymentEntity.amount;
              const currency = paymentEntity.currency || "INR"; 
              const status = paymentEntity.status;
               const method = paymentEntity.method;
                const email = paymentEntity.email;
                 const contact = paymentEntity.contact;
                  const errorCode = paymentEntity.error_code; 
                  const failureReason = paymentEntity.error_description;
                   const createdAtRazorPay = paymentEntity.created_at;
                    console.log( " Failed payment received:",
                     { razorpayPaymentId,
                         razorpayOrderId,
                          amount,
                           currency,
                            method,
                             email,
                              errorCode,
                               failureReason,
                             } );

                             let payment = await PaymentSchema.findOne({
                                razorpayPaymentId,
                             });

                             if(payment) {
                                console.log("Payment already exists:", razorpayPaymentId);
                                return NextResponse.json({
                                    success: true,
                                    message: "Payment Already processed",
                                }, {status: 200});
                             } else {
                                payment = await PaymentSchema.create({
                                    razorpayPaymentId,
                                    razorpayOrderId,
                                    amount,
                                    currency,
                                    status,
                                    method,
                                    email,
                                    contact,
                                    errorCode,
                                    ErrorDescription: failureReason,
                                    recoveryStatus: "NOT_STARTED",

                                    createdAtRazorPay: createdAtRazorPay || Math.floor(
                                        Date.now()/1000
                                    ),
                                });

                                console.log("Failed payment saved:", payment.razorpayPaymentId);

                                let aiAnalysis = null;
                                let recoveryAction = null;

                                try{
                                    console.log("Starting AI Analysis...");

                                   const aiResult =
                                   await analyzePayment({
                                     paymentId: payment.razorpayPaymentId,
                                      orderId: payment.razorpayOrderId,
                                       amount: Number( amount ),
                                        currency: String(currency),
                                         status: String(status),
                                          method: method ? String(method)
                                           : undefined,
                                            failureReason:
                                             failureReason ? String( failureReason )
                                              : undefined,
                                               customer: { email: email ? String(email)
                                                 : undefined,
                                                 },
                                                 });
                                    console.log( " Gemini AI result:", aiResult );

                                    aiAnalysis= await AIAnalysis.create({
                                        paymentId: payment._id,
                                        riskLevel: aiResult.riskLevel,
                                        recoveryProbability: aiResult.recoveryProbability,
                                        recommendedAction: aiResult.recommendedAction,
                                        reason: aiResult.reason,
                                        message: aiResult.message,
                                    });

                                    console.log("AI Analysis saved:", aiAnalysis._id);

                                    await PaymentSchema.findByIdAndUpdate(
                                        payment._id,
                                        {
                                            riskLevel: aiResult.riskLevel,

                                            recoveryProbability: aiResult.recoveryProbability,
                                            aiAction: aiResult.recommendedAction,

                                            aiReason: aiResult.reason,

                                        }
                                    );
                                    console.log("Payment updated with ai data");

                                    recoveryAction = await executeRecoveryAction(
                                        payment.razorpayPaymentId,
                                        payment.razorpayOrderId,
                                        aiResult,
                                        email,
                                        {
                                            amount: Number(amount),
                                            currency: String(currency),
                                            failureReason: failureReason? String(
                                                failureReason
                                            ): undefined,
                                        }
                                    );
                                } catch(error) {
                                    console.error("AI Recovery Error:", error);
                                }
                                return NextResponse.json({
                                    success: true,
                                    message: "Failed payment webhook processed successfully",
                                    payment,
                                    aiAnalysis,
                                    recoveryAction,
                                }, {status: 200});
                             }
                            } catch(error) {
                                console.error("Razorpay webhook error", error);

                                return NextResponse.json({
                                    success: false,
                                    message: error instanceof Error? error.message: "Webhook processing failed",
                                }, {status:500});
                            }
                        }