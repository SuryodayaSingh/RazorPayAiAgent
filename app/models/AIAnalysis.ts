import mongoose, {Schema, Document, Model} from "mongoose";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type RecoveryAction = 
| "RETRY"
| "SEND_REMINDER"
| "ALTERNATE_PAYMENT"
| "OFFER_SUPPORT"
| "FLAG_RISK" 
| "NO_ACTION";

export interface IAIAnalysis extends Document {
    paymentId: string;
    orderId?: string;
    riskLevel: RiskLevel;
    recoveryProbability: number;
    recommendedAction: RecoveryAction;
    reason: string;
    message: string;
    rawResponse?: unknown;
     createdAt: Date;
     updatedAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>({
    paymentId: {
        type: String,
        required: true,
        index: true,
    },
    orderId: {
        type: String,
    },
    riskLevel: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        required: true,
    },
    recoveryProbability: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
    },

    recommendedAction: {
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

    reason: {
        type: String,
        required: true,
    },

    message: {
        type: String,
        required: true,
    },

    rawResponse: {
        type: Schema.Types.Mixed
    },
},
);

const AIAnalysis: Model<IAIAnalysis> = 
 mongoose.models.AIAnalysis || 
 mongoose.model<IAIAnalysis>("AIAnalysis", AIAnalysisSchema);

 export default AIAnalysis;