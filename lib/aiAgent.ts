import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export type PaymentData = {
    paymentId: string;
    orderId?: string;
    amount: number;
    currency: string;
    status: string;
    method?: string;
    failureReason?: string;

    customer?: {
        email?: string;
        previousPayments?: number;
        successfulPayments?: number;
        failedPayments?: number;
    };
};

export type AIResult = {
    riskLevel: "LOW" | "MEDIUM" | "HIGH";

    recoveryProbability: number;

    recommendedAction:
        | "RETRY"
        | "SEND_REMINDER"
        | "ALTERNATE_PAYMENT"
        | "OFFER_SUPPORT"
        | "FLAG_RISK"
        | "NO_ACTION";

    reason: string;

    message: string;
};

export async function analyzePayment(
    paymentData: PaymentData
): Promise<AIResult> {

    const prompt = `You are an AI Revenue Recovery Agent for a payment platform.

Your job is to analyze failed payment transactions and recommend the safest
and most effective revenue recovery action.

Payment information:

${JSON.stringify(paymentData, null, 2)}

Analyze:

1. Payment failure reason
2. Transaction amount
3. Payment method
4. Customer payment history
5. Successful vs failed payments
6. Likelihood that the payment can be recovered

Return ONLY valid JSON.

The JSON must follow exactly this structure:

{
  "riskLevel": "LOW",
  "recoveryProbability": 0.0,
  "recommendedAction": "RETRY",
  "reason": "Short explanation",
  "message": "Customer-facing message"
}

Allowed riskLevel values:

LOW
MEDIUM
HIGH

Allowed recommendedAction values:

RETRY
SEND_REMINDER
ALTERNATE_PAYMENT
OFFER_SUPPORT
FLAG_RISK
NO_ACTION

Rules:

- recoveryProbability must be between 0 and 1.
- Never invent customer information.
- Use only the information provided.
- Consider payment history.
- Consider failure reason.
- Do not make financial guarantees.
- Do not directly execute any payment action.
- Only recommend an action.
Decision rules:

- If the failure reason is insufficient_funds and the customer has a strong
  successful payment history, prefer RETRY.

- If the failure is related to card/payment-method problems, prefer
  ALTERNATE_PAYMENT.

- If the customer has repeated failures or the failure appears difficult to
  recover, prefer OFFER_SUPPORT.

- Use SEND_REMINDER when the payment may reasonably be completed later and a
  reminder is more appropriate than an immediate retry.

- Use FLAG_RISK for suspicious, high-risk, or potentially fraudulent patterns.

- Use NO_ACTION only when there is no meaningful recovery opportunity.

- Choose exactly ONE recommendedAction.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",

            contents: prompt,

            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
            },
        });

        console.log("Gemini response received");

        const content = response.text;

        console.log("AI CONTENT:", content);

        if (!content) {
            throw new Error("AI returned an empty response");
        }

        let result: AIResult;

        try {
            result = JSON.parse(content);
        } catch (error) {
            console.error("Invalid AI JSON:", content);

            throw new Error("Gemini returned invalid JSON");
        }

        return result;

    } catch (error) {
        console.error("Gemini AI Error:", error);

        throw error;
    }
}