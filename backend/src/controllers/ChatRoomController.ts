import ChatRoom from "../models/ChatRoomModel";
import { Project } from "../models/ProjectModel";
import User from "../models/UserModel";

// export const getUserChats = async (req: any, res: any) => {
//   try {
//     const userId = req.user.id;

//     // Fetch user details
//     const user = await User.findById(userId).populate("teams projects");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     let chatRooms;

//     // if (user.role === "Admin") {
//     if (req.admin) {
//       // Admin can see all chat rooms
//       chatRooms = await ChatRoom.find().populate("project team");
//     } else if (req.user.role === "Manager") {
//       // Managers can see chat rooms for projects they manage
//       chatRooms = await ChatRoom.find({
//         project: { $in: user.projects },
//       }).populate("project team");
//     } else {
//       // Members can see chat rooms for their teams
//       chatRooms = await ChatRoom.find({ team: { $in: user.teams } }).populate(
//         "project team"
//       );
//     }
//     console.log(chatRooms);

//     // Return chat rooms
//     res.status(200).json({
//       message: "Chat rooms retrieved successfully",
//       chatRooms,
//     });
//   } catch (error: any) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error retrieving chats", error: error.message });
//   }
// };
export const getUserChatRooms = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    // Fetch user details
    const user = await User.findById(userId).populate("group project");
    if (!user) return res.status(404).json({ message: "User not found" });

    let chatRooms;

    // if (user.role === "Admin") {
    // if (req.admin) {
    // Admin can see all chat rooms
    chatRooms = await ChatRoom.find({
      participants: { $elemMatch: { $eq: user.id } },
    }).populate("project participants");
    // } else if (req.user.role === "Manager") {
    //   // Managers can see chat rooms for projects they manage
    //   chatRooms = await ChatRoom.find({
    //     project: { $in: user.projects },
    //   }).populate("project team");
    // } else {
    //   // Members can see chat rooms for their teams
    //   chatRooms = await ChatRoom.find({ team: { $in: user.teams } }).populate(
    //     "project team"
    //   );
    // }

    // Return chat rooms
    res.status(200).json({
      message: "Chat rooms retrieved successfully",
      chatRooms,
    });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error retrieving chats", error: error.message });
  }
};

// Fetch messages from a specific chat room
export const fetchMessages = async (req: any, res: any) => {
  try {
    const { chatRoomId } = req.params;

    // Validate inputs
    if (!chatRoomId) {
      return res
        .status(400)
        .json({ message: "Project and Group are required" });
    }

    // Find the chat room by project and team
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Return the messages of the chat room
    return res.status(200).json({ messages: chatRoom.messages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

export const addParticipants = async (req: any, res: any) => {
  try {
    const { chatRoomId } = req.params;
    const { participants } = req.body;

    // Validate inputs
    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Participants must be an array of user IDs." });
    }

    // Find the chat room by its ID
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found." });
    }

    // Ensure all participants exist
    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      return res.status(400).json({
        message: "One or more participants do not exist.",
        invalidParticipants: participants.filter(
          (id) => !users.some((user) => user._id === id)
        ),
      });
    }

    // Add participants to the chat room (avoiding duplicates)
    const newParticipants = participants.filter(
      (id) => !chatRoom.participants.includes(id)
    );
    chatRoom.participants.push(...newParticipants);

    // For students, add them to the project's members
    const studentIds = users
      .filter((user) => user.role === "student")
      .map((user) => user._id);

    if (studentIds.length > 0) {
      // Assuming each chat room is linked to a project and the project has a 'members' array
      const project = await Project.findOne({ chatRoom: chatRoomId }); // Find the project related to the chat room
      if (project) {
        // Add the students to the project members (avoiding duplicates)
        const updatedMembers = [
          ...new Set([...project.members, ...studentIds]),
        ];
        project.members = updatedMembers;
        await project.save();
      }
    }

    // Save the updated chat room
    await chatRoom.save();

    return res.status(200).json({
      message: "Participants added successfully.",
      chatRoom,
    });
  } catch (error: any) {
    console.error("Error adding participants:", error);
    return res.status(500).json({
      message: "Error adding participants.",
      error: error.message,
    });
  }
};
export const getCreateChatRoom = async (req: any, res: any) => {
  const { receiverId } = req.params;
  const userId = req.user.id;

  try {
    // Check for an existing chatroom
    const existingChatRoom = await ChatRoom.findOne({
      participants: { $all: [userId, receiverId] },
      type: "one-to-one",
    });

    if (existingChatRoom) {
      return res.status(200).json(existingChatRoom);
    }

    // No chatroom exists, return only virtual flag
    return res.status(200).json({
      chatroomId: null,
      isVirtual: true,
      receiverName: "Receiver Name",
    });
  } catch (error: any) {
    console.error("Error fetching chatroom:", error);
    return res.status(500).json({
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
export const createChatRoom = async (req: any, res: any) => {
  const { receiverId } = req.params;
  const userId = req.user.id;

  try {
    // Check for an existing chatroom
    const existingChatRoom = await ChatRoom.findOne({
      participants: { $all: [userId, receiverId] },
      type: "one-to-one",
    });

    if (existingChatRoom) {
      return res.status(409).json("Chatroom already exists");
    }

    // No chatroom exists, return only virtual flag
    const chatRoom = await ChatRoom.create({
      participants: [userId, receiverId],
      type: "one-to-one",
    });

    return res.status(200).json(chatRoom);
  } catch (error: any) {
    console.error("Error fetching chatroom:", error);
    return res.status(500).json({
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
