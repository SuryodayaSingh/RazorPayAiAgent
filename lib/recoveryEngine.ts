import RecoveryAction from "@/app/models/RecoveryAction";
import { AIResult } from "./aiAgent";
import { sendRecoveryEmail } from "./sendRecoveryEmail";


type RecoveryPaymentData = {
    amount?: number;
    currency?: string;
    failureReason?: string;
};

export async function executeRecoveryAction(
     paymentId: string,
    orderId: string | undefined,
    aiResult: AIResult,
    customerEmail?: string,
    paymentData?: RecoveryPaymentData
) {
    const action = aiResult.recommendedAction;
    console.log(`Recovery Engine: ${action} for ${paymentId}`)

    const recovery = await RecoveryAction.create({
        paymentId,
        orderId,
        action,
        status: "PENDING",
        message: aiResult.message,
    });

    try{
        switch (action) {
            case "RETRY" :
                console.log(`Retry recommended for payment ${paymentId}`);
                return recovery;

                break;

                case "ALTERNATE_PAYMENT":
                    if(customerEmail) {
                        await sendRecoveryEmail(
                            customerEmail,
                            aiResult.message,
                            {
                                paymentId,
                                orderId,
                                amount: paymentData?.amount,
                                currency: paymentData?.currency,
                                failureReason: paymentData?.failureReason,
                                action,
                            }
                        );
                        console.log(`Alternate payment email sent for ${paymentId}`);

                        recovery.status = "EXECUTED";
                        recovery.executedAt = new Date();

                        await recovery.save();

                        return recovery;
                    }

            

              case "OFFER_SUPPORT" :
                if (customerEmail) {
                    await sendRecoveryEmail(
                        customerEmail,
                        aiResult.message,
                        {
                            paymentId,
                            orderId,
                            amount: paymentData?.amount,
                            currency: paymentData?.currency,
                            failureReason: paymentData?.failureReason,
                            action,
                        }
                    );
                }
                console.log(
                    `Support email sent for ${paymentId}`
                );

                recovery.status = "EXECUTED";
                recovery.executedAt = new Date();

                await recovery.save();

                return recovery;
            
                
                case "FLAG_RISK" :
                console.log(`Payment ${paymentId} flagged as risk`);

                recovery.status = "EXECUTED";
                recovery.executedAt = new Date();

                await recovery.save();

                return recovery;
            

                case "SEND_REMINDER" :
                    if(customerEmail) {
                        await sendRecoveryEmail(
                            customerEmail,
                             aiResult.message,
                              {
                paymentId,
                orderId,
                amount: paymentData?.amount,
                currency: paymentData?.currency,
                failureReason: paymentData?.failureReason,
                action,
                }
                       );
                    }

                    console.log(
                    `Reminder email sent for ${paymentId}`
                );

                recovery.status = "EXECUTED";
                recovery.executedAt = new Date();

                await recovery.save();

                return recovery;
        


                case "NO_ACTION" :
                console.log(`No recovery Action required for ${paymentId}`);

                 recovery.status = "SKIPPED";
                recovery.executedAt = new Date();

                await recovery.save();

                return recovery;
        
        default: {
            throw new Error(
                `Unsupported recovery action: ${action}`
            );
        }
    }

    } catch(error) {
        console.error("Recovery Engine Error: ", error);

        recovery.status = "FAILED";

        recovery.error = error instanceof Error
        ? error.message : "Unknown error";

        await recovery.save();

        throw error;
    }
}