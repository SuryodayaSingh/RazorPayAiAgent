import crypto from "crypto";
import { NextResponse } from "next/server";
import PaymentSchema from "@/app/models/PaymentSchema";
import WebhookEvent from "@/app/models/WebhookEvent";
import dbConnect from "@/lib/dbConnect";


export async function POST(req: Request) {
    try{
        const rawBody = await req.text();

        const signature = req.headers.get("x-razorpay-signature");

        const eventId =  req.headers.get("x-razorpay-event-id");


        if(!signature || !eventId) {
            return NextResponse.json(
                {error: "Invalid webhook"},
                {status: 400}
            );
        }

        const expectedSignature = crypto
        .createHmac(
            "sha256",
            process.env.Razorpay_Webhook_Secret
        )
        .update(rawBody)
        .digest("hex");

        if (signature !== expectedSignature) {
            return NextResponse.json(
                 { error: "Invalid signature" },
        { status: 401 }
            );
        }

         const payload = JSON.parse(rawBody);

         await dbConnect();

         const existingEvent = await WebhookEvent.findOne({eventId});

         if(existingEvent) {
              return NextResponse.json({
        success: true,
        duplicate: true,
      });
         }

         await WebhookEvent.create({
            eventId,
            event: payload.event,
            payload,
            processed: false,
         });

         if (payload.event === "payment.captured") {
            const payment = payload.payload.payment.entity;

            await PaymentSchema.findOneAndUpdate( {
                razorpayPaymentId: payment.id,
            },
            {
                 razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          createdAtRazorpay: payment.created_at,
            },
            {
                upsert: true,
                new: true,
            }
        )
         }

         if(payload.event === "payment.failed") {
            const Payment = payload.payload.payment.entity;

            await Payment.findOneAndUpdate(
                {
                razorpayPaymentId: Payment.Id,
                },
                {
                      razorpayPaymentId: Payment.id,
          razorpayOrderId: Payment.order_id,
          amount: Payment.amount,
          currency: Payment.currency,
          status: "failed",
          method: Payment.method,
          email: Payment.email,
          contact: Payment.contact,
          errorCode: Payment.error_code,
          errorDescription:
            Payment.error_description,
                },
                {
                    upsert: true,
                }
            );
         }

         await WebhookEvent.findOneAndUpdate(
            {eventId},
            {processed: true}
         );

         return NextResponse.json ({
            success: true,
         });
}
catch(error) {
    console.error(error);

    return NextResponse.json({
        error: "Webhook processing failed"
    },
    {status: 500} 
);
}
    }

   