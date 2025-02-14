import { Group } from "../models/GroupModel"; // Make sure the path is correct
import User, { IUser } from "../models/UserModel";
import { Notification } from "../models/NotificationModel";
import { getIO } from "../utils/socket-io";

// Create a new group
export const createGroup = async (req: any, res: any) => {
  try {
    const { name, members, project } = req.body;
    let arrayMembers;
    if (Array.isArray(members)) {
      arrayMembers = members;
    } else {
      arrayMembers = [members];
    }

    const membersIds: IUser["_id"][] = [];
    const errors: string[] = [];
    await Promise.all(
      arrayMembers.map(async (member) => {
        try {
          if (req.user.id === member) {
            return;
          }
          const user = await User.findById(member).select("_id username group");
          if (!user) {
            return;
          }
          if (user.group) {
            errors.push(
              `User with name ${user.username} is already a member of a group`
            );
            return;
          }

          membersIds.push(user._id);
        } catch (error) {
          return;
        }
      })
    );

    if (membersIds.length < 1) {
      return res
        .status(404)
        .json({ message: "user(s) not found or already a member of a group" });
    }

    // Create the new group
    const group = await Group.create({
      name,
      members:
        req.user.role === "student" ? [req.user.id, ...membersIds] : membersIds,
      project: project ? project : null,
    });
    if (!group) {
      return res.status(401).json({ message: "Group creation failed" });
    }

    // Send notifications to the members of the group
    const io = getIO();
    const notifications = [];

    // Notify each member about being added to the group
    membersIds.forEach((memberId) => {
      notifications.push(
        Notification.create({
          message: `You have been added to the group "${name}".`,
          recipient: memberId,
        })
      );
      io.to(memberId.toString()).emit("group_added", {
        message: `You have been added to the group "${name}".`,
        group,
      });
    });

    // Optionally, notify the creator as well (if not included in membersIds)
    if (req.user.id && !membersIds.includes(req.user.id)) {
      notifications.push(
        Notification.create({
          message: `You created the group "${name}".`,
          recipient: req.user.id,
        })
      );
      io.to(req.user.id.toString()).emit("group_created", {
        message: `You created the group "${name}".`,
        group,
      });
    }

    // Wait for notifications to be saved
    await Promise.all(notifications);

    return res.status(201).json(group);
  } catch (error: any) {
    console.error({ error: "Error creating group", message: error.message });
    return res
      .status(500)
      .json({ error: "Error creating group", message: error.message });
  }
};

// Get all groups
export const getGroups = async (req: any, res: any) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    // Set up basic query object
    const searchQuery: any = query
      ? { name: { $regex: new RegExp(query as string, "i") } }
      : {};

    let filter: any;
    if (req.user.role == "supervisor") {
      filter = { supervisor: req.user.id };
    } else if (req.admin) {
      filter = {};
    } else {
      const user = await User.findById(req.user.id).select("project group");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      filter = { _id: user.group };
    }

    // Fetch groups with pagination
    const groups = await Group.find({ ...searchQuery, ...filter })

      .skip((+page - 1) * +limit)
      .limit(+limit);

    // Get total count for pagination
    const totalGroups = await Group.countDocuments(searchQuery);

    // Send response with pagination metadata
    res.json({
      data: groups,
      currentPage: +page,
      totalPages: Math.ceil(totalGroups / +limit),
      totalgroups: totalGroups,
    });
  } catch (error: any) {
    console.error({ error: "Error fetching group", message: error.message });
    res
      .status(500)
      .json({ message: "Error fetching groups", error: error.message });
  }
};

// Get a single group by ID
export const getGroupById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id).populate("members");
    if (!group) {
      return res.status(404).json({ message: "group not found" });
    }
    return res.status(200).json(group);
  } catch (error: any) {
    console.error({ error: "Error fetching group", message: error.message });
    return res
      .status(500)
      .json({ error: "Error fetching group", message: error.message });
  }
};

// Update a group
export const updateGroup = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedGroup = await Group.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("members");
    if (!updatedGroup) {
      return res.status(404).json({ message: "group not found" });
    }
    return res.status(200).json(updatedGroup);
  } catch (error: any) {
    console.error({ error: "Error updating group", message: error.message });
    return res
      .status(500)
      .json({ error: "Error updating group", message: error.message });
  }
};

// Delete a group
export const deleteGroup = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    let deletedGroup;
    if (req.admin === true) {
      deletedGroup = await Group.findByIdAndDelete(id);
    } else {
      deletedGroup = await Group.findOneAndDelete({
        _id: id,
        supervisor: req.user._id,
      });
    }
    if (!deletedGroup) {
      return res.status(404).json({ message: "group not found" });
    }
    return res.status(200).json({ message: "group deleted successfully" });
  } catch (error: any) {
    console.error({ error: "Error deleting group", message: error.message });
    return res
      .status(500)
      .json({ error: "Error deleting group", message: error.message });
  }
};

export const addGroupMembers = async (req: any, res: any) => {
  try {
    const { memberIds } = req.body;
    const { groupId } = req.params;

    // Validate group existence
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "group not found" });
    }

    const members = Array.isArray(memberIds) ? memberIds : [memberIds];

    // Fetch valid users
    const users = await User.find({ _id: { $in: members } }).select("_id");

    // Add only valid users to the group (prevent duplicates)
    const uniqueMembers = [...new Set([...group.members, ...memberIds])];
    group.members = uniqueMembers;

    await group.save();

    // Send response with details of the operation
    res.status(200).json({
      message: "Operation completed",
      group: group,
    });
  } catch (error) {
    console.error("Error adding members to group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMembers = async (req: any, res: any) => {
  try {
    const { groupId } = req.params;

    // Find group and populate members
    const group = await Group.findById(groupId).populate(
      "members",
      "username email"
    );
    if (!group) {
      return res.status(404).json({ message: "group not found" });
    }

    res.status(200).json({
      message: "group members retrieved successfully",
      _id: group._id,
      members: group.members,
    });
  } catch (error) {
    console.error("Error retrieving group members:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeGroupMember = async (req: any, res: any) => {
  try {
    const { groupId, memberId } = req.params;

    // Find group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "group not found" });
    }

    // Check if member exists in the group
    if (!group.members.includes(memberId)) {
      return res.status(400).json({ message: "Member not found in the group" });
    }

    // Remove the member
    group.members = group.members.filter((id) => id !== memberId);

    await group.save();

    res
      .status(200)
      .json({ message: "Member removed successfully", group: group });
  } catch (error) {
    console.error("Error removing member from group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
