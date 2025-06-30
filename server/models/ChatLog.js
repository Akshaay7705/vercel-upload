import mongoose from 'mongoose';

const chatLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  encryptedPrompt: {
    type: String,
    required: [true, 'Encrypted prompt is required']
  },
  encryptedResponse: {
    type: String,
    required: [true, 'Encrypted response is required']
  },
  promptHash: {
    type: String,
    required: true,
    index: true // For duplicate detection without decryption
  },
  responseLength: {
    type: Number,
    required: true
  },
  processingTime: {
    type: Number,
    default: 0
  },
  blocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String,
    default: null
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  category: {
    type: String,
    enum: ['safe', 'jailbreak', 'system', 'sensitive', 'error', 'intent_mismatch'],
    default: 'safe'
  },
  sessionId: {
    type: String,
    index: true
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  collection: 'chatlogs'
});

// Indexes for better query performance
chatLogSchema.index({ userId: 1, createdAt: -1 });
chatLogSchema.index({ createdAt: -1 });
chatLogSchema.index({ blocked: 1, createdAt: -1 });
chatLogSchema.index({ category: 1, createdAt: -1 });

// Virtual for chat age
chatLogSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Static method to get user's chat history
chatLogSchema.statics.getUserChats = function(userId, limit = 50, skip = 0) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select('-encryptedPrompt -encryptedResponse') // Exclude encrypted data for listing
    .lean();
};

// Static method to get chat statistics
chatLogSchema.statics.getChatStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalChats: { $sum: 1 },
        blockedChats: { $sum: { $cond: ['$blocked', 1, 0] } },
        avgProcessingTime: { $avg: '$processingTime' },
        avgResponseLength: { $avg: '$responseLength' },
        categoryCounts: {
          $push: '$category'
        }
      }
    }
  ]);
};

// Instance method to check if chat is recent
chatLogSchema.methods.isRecent = function(minutes = 5) {
  return (Date.now() - this.createdAt.getTime()) < (minutes * 60 * 1000);
};

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

export default ChatLog;