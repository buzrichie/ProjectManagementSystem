import { Message } from "../models/Message";

// Fetch messages from a specific chat room
export const getMessages = async (req: any, res: any) => {
  const { chatRoom } = req.params;
  try {
    const messages = await Message.find({ chatRoom })
      .populate("sender chatRoom")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(messages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      message: "Error fetching messages",
      error: error.message,
    });
  }
};
