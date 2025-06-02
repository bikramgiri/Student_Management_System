const Chat = require('../models/chat');

exports.sendMessage = async (req, res) => {
  try {
    const { _id: senderId } = req.user;
    const { recipient, message } = req.body;
    const chat = new Chat({ sender: senderId, recipient, message });
    await chat.save();
    res.status(201).json({ message: 'Message sent', chat });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
      try {
        const { _id: userId } = req.user;
        const { recipient } = req.params;
        const messages = await Chat.find({
          $or: [
            { sender: userId, recipient },
            { sender: recipient, recipient: userId },
          ],
        }).sort('createdAt');
        res.status(200).json({ messages });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    };