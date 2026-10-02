const mongoose = require('mongoose');
const { STATUSES, PRIORITIES } = require('./constants');

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    priority: { type: String, enum: PRIORITIES, default: 'Medium', required: true },
    status: { type: String, enum: STATUSES, default: 'Open', required: true },
  },
  {
    // createdAt / updatedAt are generated automatically
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Indexes that back the list page's filters / sorting
ticketSchema.index({ createdAt: -1, _id: -1 });
ticketSchema.index({ status: 1, priority: 1, createdAt: -1 });
ticketSchema.index({ customerEmail: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
