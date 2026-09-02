import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

type RecoveryEmailOptions = {
    paymentId?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    failureReason?: string;
    action?: string;
};

export async function sendRecoveryEmail(
    email: string,
    message: string,
    options: RecoveryEmailOptions = {}
) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error(
            "EMAIL_USER and EMAIL_PASSWORD must be configured"
        );
    }

    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    const paymentId = options.paymentId
        ? escapeHtml(options.paymentId)
        : "";

    const orderId = options.orderId
        ? escapeHtml(options.orderId)
        : "";

    const failureReason = options.failureReason
        ? escapeHtml(options.failureReason)
        : "";

    const action = options.action
        ? escapeHtml(options.action.replace(/_/g, " "))
        : "";

    const amount =
        typeof options.amount === "number"
            ? new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: options.currency || "INR",
              }).format(options.amount / 100)
            : "";

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Payment Recovery</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f6f8;
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
">

    <div style="
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #e5e7eb;
    ">

        <!-- Header -->
        <div style="
            padding: 24px;
            background: #111827;
            color: #ffffff;
        ">
            <h1 style="
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            ">
                Payment Recovery
            </h1>

            <p style="
                margin: 8px 0 0;
                color: #d1d5db;
                font-size: 14px;
            ">
                Action required for your recent payment
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 24px;">

            <h2 style="
                margin: 0 0 12px;
                font-size: 20px;
                color: #111827;
            ">
                Your payment couldn't be completed
            </h2>

            <p style="
                margin: 0 0 24px;
                font-size: 15px;
                line-height: 1.7;
                color: #4b5563;
            ">
                ${safeMessage}
            </p>

            ${
                amount ||
                paymentId ||
                orderId ||
                failureReason ||
                action
                    ? `
            <!-- Payment Details -->
            <div style="
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 18px;
                margin-bottom: 24px;
            ">

                <h3 style="
                    margin: 0 0 14px;
                    font-size: 16px;
                    color: #111827;
                ">
                    Payment Details
                </h3>

                ${
                    amount
                        ? `
                <p style="margin: 8px 0; font-size: 14px;">
                    <strong>Amount:</strong> ${amount}
                </p>
                `
                        : ""
                }

                ${
                    paymentId
                        ? `
                <p style="margin: 8px 0; font-size: 14px;">
                    <strong>Payment ID:</strong> ${paymentId}
                </p>
                `
                        : ""
                }

                ${
                    orderId
                        ? `
                <p style="margin: 8px 0; font-size: 14px;">
                    <strong>Order ID:</strong> ${orderId}
                </p>
                `
                        : ""
                }

                ${
                    failureReason
                        ? `
                <p style="margin: 8px 0; font-size: 14px;">
                    <strong>Reason:</strong> ${failureReason}
                </p>
                `
                        : ""
                }

                ${
                    action
                        ? `
                <p style="margin: 8px 0; font-size: 14px;">
                    <strong>Recommended Action:</strong> ${action}
                </p>
                `
                        : ""
                }

            </div>
            `
                    : ""
            }

            <!-- Action -->
            <div style="
                background: #f3f4f6;
                border-radius: 8px;
                padding: 18px;
                margin-bottom: 24px;
            ">
                <p style="
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #374151;
                ">
                    Please review the payment details and try again if
                    appropriate. If you continue to experience problems,
                    contact customer support.
                </p>
            </div>

            <p style="
                margin: 0;
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
            ">
                If you did not attempt this payment, you can safely ignore
                this email.
            </p>

        </div>

        <!-- Footer -->
        <div style="
            padding: 20px 24px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        ">
            <p style="
                margin: 0;
                font-size: 12px;
                color: #9ca3af;
            ">
                This is an automated payment recovery notification.
            </p>
        </div>

    </div>

</body>
</html>
`;

    const text = `
Payment Recovery

Your payment couldn't be completed.

${message}

${amount ? `Amount: ${amount}` : ""}
${paymentId ? `Payment ID: ${options.paymentId}` : ""}
${orderId ? `Order ID: ${options.orderId}` : ""}
${failureReason ? `Reason: ${options.failureReason}` : ""}
${action ? `Recommended Action: ${options.action?.replace(/_/g, " ")}` : ""}

Please review the payment details and try again if appropriate.

If you continue to experience problems, contact customer support.

This is an automated payment recovery notification.
`;

    await transporter.sendMail({
        from: `"Payment Recovery AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Payment Recovery - Action Required",
        text,
        html,
    });

    console.log(`Recovery email sent to ${safeEmail}`);
}