import mongoose, {Schema, Document, Model} from "mongoose";

export type RecoveryActionType = 
| "RETRY"
| "SEND_REMINDER"
| "ALTERNATE_PAYMENT"
| "OFFER_SUPPORT"
| "FLAG_RISK"
| "NO_ACTION";

export type RecoveryStatus = 
| "PENDING"
| "EXECUTED"
| "FAILED"
| "SKIPPED";

export interface IRecoveryAction extends Document {
    paymentId: string;
    orderId?: string;
    action: RecoveryActionType;
    status: RecoveryStatus;
    message?: string;
    executedAt?: Date;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

const RecoveryActionSchema = new Schema<IRecoveryAction> ({
    paymentId: {
        type: String,
        required: true,
        index: true,
    },
    orderId: {
        type: String,
    },
    action: {
        type: String,
        enum: [
            "RETRY",
            "SEND_REMINDER",
            "ALTERNATE_PAYMENT",
            "OFFER_SUPPORT",
            "FLAG_RISK",
            "NO_ACTION",
        ],
        required: true,
    },
    status: {
        type: String,
        enum: [
            "PENDING",
            "EXECUTED",
            "FAILED",
            "SKIPPED"
        ],
        default: "PENDING",
    },
    message: {
        type: String,
    },
    executedAt: {
        type: Date,
        },
        error: {
            type: String,
        },
})

const RecoveryAction: Model<IRecoveryAction> = mongoose.models.RecoveryAction || 
                                            mongoose.model<IRecoveryAction> (
                                                "RecoveryAction",
                                                RecoveryActionSchema
                                            );

                                            

export default RecoveryAction;                                            