const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    machine: {
      type: String,
      required: true,
    },
    oCPunt: {
      type: Boolean,
      required: true,
    },
    reportText: {
      type: String,
      required: true,
    },
    archived: {
      type: Boolean,
      required: true,
    },
    shift: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: String,
      default: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
