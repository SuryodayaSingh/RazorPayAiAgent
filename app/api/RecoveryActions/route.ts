import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RecoveryAction from "@/app/models/RecoveryAction";


export async function GET() {
    try{
        await dbConnect();

        const recoveryActions = await RecoveryAction
        .find()
        .sort({createdAt: -1});

        return NextResponse.json({
            success: true,
            recoveryActions,
        }, {status:200});
    } catch(error) {
        console.error("Recovery Actions Error", error);

        return NextResponse.json({
            success: false,
            message:"Failed to fetch recovery actions",
        }, {status: 500});
    }
}