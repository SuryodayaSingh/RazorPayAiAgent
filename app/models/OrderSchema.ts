import mongoose, {models} from "mongoose";

const OrderSchema= new mongoose.Schema({
    razorpayOrderId:{
        type: String,
        required: true,
        unique: true,
    },
    amount: Number,
    currency: String,
    status: String,
    customerId: String,
    receipt: String,
    paymentIds: [String],
});

export default models.Order || mongoose.model("Order", OrderSchema);