const mongoose = require("mongoose");

const documentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // file: File,
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    docType: {
      type: String
    },
    tags: [String],
    fileSize: Number,
    access: {
      type: String,
      enum: ['public', 'private'],
      default: 'private'
    },
    fileLocation: String
  },
  {
    timestamps: true,
  }
);



const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
