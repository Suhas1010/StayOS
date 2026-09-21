import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    rent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rent",
        required: true,
        index: true
    },

    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true,
        index: true
    },

    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true,
        index: true
    },

    amount: {
        type: Number,
        required: true
    },

    paymentDate: {
        type: Date,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ["CASH", "UPI", "CARD", "BANK_TRANSFER"],
        required: true
    },

    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },

    status: {
        type: String,
        enum: ["SUCCESS", "FAILED", "REFUNDED"],
        default: "SUCCESS"
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;