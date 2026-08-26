import mongoose, {Schema, models} from "mongoose";
import { unique } from "next/dist/build/utils";

const WebhookEventSchema= new mongoose.Schema ({
    eventId: {
        type: String,
        unique: true,
        required: true,
    },
    event: String,
    proccessed: {
        type: Boolean,
        default: false,
    },

    payload: Schema.Types.Mixed,
});


export default models.WebhookEvent || mongoose.model("WebhookEvent", WebhookEventSchema);