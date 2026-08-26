import mongoose, { models } from "mongoose";

const PaymentSchema= new mongoose.Schema({
    razorpayPaymentId:{
        type: String,
        required: true,
        unique: true,
    } ,
    razorpayOrderId:{
        type:  String,
        index: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        index: true,
    },
    amount: Number,
    currency: {
        type: String,
        default: "INR"
    },
    status: {
        type: String,
        enum: [
            "created", "authorized", "captured", "failed", "refunded",
        ]
    },

    method: String,

    email: String,
    contact: String,
    errorCode: String,


    ErrorDescription: String,

    riskScore: {
        type: Number,
        default: 0,
    },
    riskLevel: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: "LOW",
    },


    recoveryProbability: {
        type: Number,
        default: 0,
    },
    aiAction: String,
    aiReason: String,

    createdAtRazorPay: Number,
});


export default models.Payment || mongoose.model("Payment", PaymentSchema);