import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    status: {
      type: String,
      enum: [
        "Open",
        "In Progress",
        "Waiting for Customer",
        "Resolved",
        "Closed",
      ],
      default: "Open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ticketSchema.pre("validate", function assignTicketNumber(next) {
  if (!this.ticketNumber)
    this.ticketNumber = `HD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  next();
});
ticketSchema.index({ title: 1 });

export default mongoose.model("Ticket", ticketSchema);
