import Razorpay from "razorpay";

export const razorpay = new Razorpay({
    key_id: process.env.Razorpay_Key_id,
    key_secret: process.env.Razorpay_Key_Secret,
});