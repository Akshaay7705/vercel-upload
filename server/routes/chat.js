import express from 'express';
import ChatLog from '../models/ChatLog.js';
import User from '../models/User.js';
import { encryptionService } from '../utils/encryption.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authHandler.js';

const router = express.Router();

// @desc    Save a chat log entry
// @route   POST /api/chat/save
// @access  Public (should be protected in production)
router.post('/chat/save', authenticate, asyncHandler(async (req, res) => {
  const {_id : userId} = req.user;
  const {
    prompt,
    response,
    processingTime = 0,
    blocked = false,
    blockReason = null,
    confidence = 0,
    category = 'safe',
    sessionId = null,
  } = req.body;

  // Validation
  if (!prompt || !response) {
    return res.status(400).json({
      success: false,
      message: 'Prompt, and response are required',
    });
  }


  try {
    // Encrypt sensitive data
    const encryptedPrompt = encryptionService.encrypt(prompt);
    const encryptedResponse = encryptionService.encrypt(response);
    const promptHash = encryptionService.createHash(prompt);

    // Create chat log entry
    const chatLog = new ChatLog({
      userId,
      encryptedPrompt,
      encryptedResponse,
      promptHash,
      responseLength: response.length,
      processingTime,
      blocked,
      blockReason,
      confidence,
      category,
      sessionId: sessionId || encryptionService.generateSessionId(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    });

    await chatLog.save();

    res.status(201).json({
      success: true,
      message: 'Chat saved successfully',
      data: {
        id: chatLog._id,
        timestamp: chatLog.createdAt,
        blocked,
        category,
        processingTime,
      },
    });
  } catch (error) {
    console.error('Chat save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}));

// @desc    Get user's chat history
// @route   GET /api/chat/history/:userId
// @access  Public (should be protected in production)

router.get('/chat/history', authenticate, asyncHandler(async (req, res) => {
   const { _id: userId } = req.user;
  const { limit = 50, skip = 0 } = req.query;

  try {
    const chatLogs = await ChatLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('+encryptedPrompt +encryptedResponse')
      .lean();

    const processedLogs = chatLogs.map(log => {
      const processedLog = {
        id: log._id,
        timestamp: log.createdAt,
        blocked: log.blocked,
        blockReason: log.blockReason,
        confidence: log.confidence,
        category: log.category,
        processingTime: log.processingTime,
        responseLength: log.responseLength,
        sessionId: log.sessionId,
      };

      try {
        processedLog.prompt = encryptionService.decrypt(log.encryptedPrompt);
        processedLog.response = encryptionService.decrypt(log.encryptedResponse);
      } catch (error) {
        console.error(`Decryption error for log ${log._id}:`, error);
        processedLog.prompt = '[Decryption Error]';
        processedLog.response = '[Decryption Error]';
      }

      return processedLog;
    });

    res.status(200).json({
      success: true,
      data: {
        chats: processedLogs,
        total: processedLogs.length,
        hasMore: processedLogs.length === limit,
      },
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}));

// @desc    Get chat statistics for a user
// @route   GET /api/chat/stats/:userId
// @access  Public (should be protected in production)
router.get('/chat/stats', authenticate, asyncHandler(async (req, res) => {
  const { _id : userId } = req.user;

  try {
    const stats = await ChatLog.getChatStats(userId);
    
    if (!stats || stats.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalChats: 0,
          blockedChats: 0,
          successRate: 0,
          avgProcessingTime: 0,
          avgResponseLength: 0,
          categoryBreakdown: {},
        },
      });
    }

    const statData = stats[0];
    
    // Process category counts
    const categoryBreakdown = {};
    if (statData.categoryCounts) {
      statData.categoryCounts.forEach(category => {
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
      });
    }

    const successRate = statData.totalChats > 0 
      ? ((statData.totalChats - statData.blockedChats) / statData.totalChats) * 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalChats: statData.totalChats || 0,
        blockedChats: statData.blockedChats || 0,
        successRate: Math.round(successRate * 100) / 100,
        avgProcessingTime: Math.round((statData.avgProcessingTime || 0) * 100) / 100,
        avgResponseLength: Math.round((statData.avgResponseLength || 0) * 100) / 100,
        categoryBreakdown,
      },
    });
  } catch (error) {
    console.error('Chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}));

// @desc    Delete a specific chat
// @route   DELETE /api/chat/:chatId
// @access  Public (should be protected in production)
router.delete('/chat/:chatId', asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // Validate chatId format
  if (!chatId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid chat ID format',
    });
  }

  try {
    const chatLog = await ChatLog.findByIdAndDelete(chatId);

    if (!chatLog) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully',
    });
  } catch (error) {
    console.error('Chat delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}));

// @desc    Clear all chats for a user
// @route   DELETE /api/chat/clear/:userId
// @access  Public (should be protected in production)
router.delete('/chat/clear/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate userId format
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format',
    });
  }

  try {
    const result = await ChatLog.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} chats successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Chat clear error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}));

export default router;