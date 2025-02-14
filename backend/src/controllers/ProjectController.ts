import ChatRoom from "../models/ChatRoomModel";
import { IProject, Project } from "../models/ProjectModel";
import { Task } from "../models/TaskModel";
import { IGroup, Group } from "../models/GroupModel";
import User, { IUser } from "../models/UserModel";
import { getIO } from "../utils/socket-io";
import { Notification } from "../models/NotificationModel";
import { File } from "../models/FileModel";
import { Documentation } from "../models/DocumentationModel";

export const createProject = async (req: any, res: any) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      supervisor,
      group,
      status,
      department,
      objectives,
      technologies,
      projectType,
    } = req.body;

    // Validate required fields
    if (!name || !description || !projectType) {
      return res
        .status(400)
        .json({ message: "Project name and manager are required" });
    }

    if (req.user.role === "student") {
      const proposedP = await Project.create({
        name,
        description,
        startDate,
        endDate,
        projectType,
        department,
        status: "proposed",
        objectives,
      });
      if (!proposedP) {
        throw new Error("Failed to add proposed project");
      }

      // Emit notification to users in the "notification" room
      const io = getIO();
      io.to("new:project").emit("new:project", {
        message: `A new proposed project "${proposedP.name}" has been created.`,
        project: proposedP,
      });

      return res.status(201).json({
        message:
          "Project created successfully, chat room initialized for groups",
        project: proposedP,
      });
    }

    let validgroups: any[] = [];

    if (group) {
      const arrgroup = Array.isArray(group) ? group : [group];
      validgroups = await Group.find({ _id: { $in: arrgroup } }).select("_id");
    }

    // Create the new project
    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      admin: req.user.id,
      supervisor,
      group: validgroups.length > 0 ? validgroups : [],
      status,
      department,
      objectives,
      technologies,
      projectType,
    });

    // Save the project
    const newProject = await project.save();
    if (!newProject) {
      throw new Error("Failed to create project");
    }

    // Ensure that the project has groups before initializing chat rooms
    if (newProject.groups.length > 0) {
      for (const groupId of newProject.groups) {
        const chatRoomExists = await ChatRoom.findOne({
          project: newProject._id,
          group: groupId,
          type: "group",
        });

        if (!chatRoomExists) {
          await ChatRoom.create({
            name: `group_${req.user.username}_${project.name}`,
            project: newProject._id,
            group: groupId,
            messages: [],
          });
        }
      }
    }

    // Emit notification to users in the "notification" room
    const io = getIO();
    io.to("new:project").emit("new:project", {
      message: `A new project "${newProject.name}" has been created.`,
      project: newProject,
    });

    return res.status(201).json({
      message: "Project created successfully, chat room initialized for groups",
      project: newProject,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: "Error creating project",
      message: error.message,
    });
  }
};

export const getProjects = async (req: any, res: any) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    // Set up the search query
    let searchQuery: any = {
      ...(query ? { name: { $regex: new RegExp(query as string, "i") } } : {}),
    };

    // If the user is not an admin, exclude "proposed" and "declined" projects
    if (!req.admin) {
      searchQuery.status = { $nin: ["proposed", "declined"] };
    }

    // Fetch projects with pagination
    const projects = await Project.find(searchQuery)
      .populate("supervisor members proposedUser")
      .skip((+page - 1) * +limit)
      .limit(+limit);

    // Get the total count of projects for pagination metadata
    const totalProjects = await Project.countDocuments(searchQuery);

    // Send response with data and pagination details
    return res.status(200).json({
      data: projects,
      currentPage: +page,
      totalPages: Math.ceil(totalProjects / +limit),
      totalProjects,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Error fetching projects",
      message: error.message,
    });
  }
};

// Get groups for specific project
export const getProjectGroups = async (req: any, res: any) => {
  try {
    const { id } = req.params; // Project ID from the route parameter
    const userId = req.user.id; // User ID from the authenticated request

    // Find the user to verify their relation to the project
    const user = await User.findById(userId).select("groups projects");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If the user is an admin, fetch all groups for the project
    if (req.admin) {
      const project = await Project.findById(id)
        .select("groups -_id")
        .populate("groups"); // Populate group details
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.status(200).json({
        data: project.groups,
      });
    }

    // For regular users, filter groups based on their membership
    const project = await Project.findById(id)
      .select("group -_id")
      .populate({
        path: "group",
        match: { members: { $in: [userId] } }, // Filter groups where the user is a member
      });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Respond with the filtered group data
    return res.status(200).json({
      data: project.groups, // Only groups the user belongs to
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Error fetching groups for the project",
      message: error.message,
    });
  }
};

// Get Members for specific project
export const getProjectMembers = async (req: any, res: any) => {
  try {
    const { id } = req.params; // Project ID from route parameters
    const userId = req.user.id; // Authenticated user ID
    const userRole = req.user.role; // Authenticated user's role

    let filter: any;

    const adminAccessRoles = [
      "admin",
      "hod",
      "project_coordinator",
      "super_admin",
    ];

    // Admin can access all project members
    if (adminAccessRoles.includes(userRole)) {
      filter = { _id: id };
    } else {
      // const user = await User.findById(userId).select("groups projects");
      // if (!user) {
      //   return res.status(404).json({ error: "User not found" });
      // }
      if (req.user.role === "supervisor") {
        // Managers can see chat rooms for projects they manage

        // filter = { project: { $in: user.projects } };
        filter = { supervisor: req.user.id };
      } else {
        // console.log(user);

        // Project Manager can access members of groups they're managing
        // if (userRole === "project_manager") {
        filter = { members: req.user.id };
        // } else {
        //   // Regular users can only access projects they belong to
        //   filter = { _id: id, "group.members": userId };
        // }
      }
    }
    // Find the project and populate its groups
    const projectMembers = await Project.findOne(filter)
      .select("members")
      .populate({
        path: "members",
        select: "username email role status",
      });

    if (!projectMembers) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Extract members from the populated groups
    // const members = project.group.flatMap((group: any) => group.members);

    // Send response
    return res.status(200).json({
      data: projectMembers,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Error fetching project members",
      message: error.message,
    });
  }
};
// Get task for specific project
export const getProjectTasks = async (req: any, res: any) => {
  try {
    const { id } = req.params; // Project ID from route parameters
    const userId = req.user.id; // Authenticated user ID
    const userRole = req.user.role; // Authenticated user's role

    let filter: any;

    // Admin can access all tasks in the project
    // if (req.admin == false) {
    filter = { project: id };
    // } else {
    //   const user = await User.findById(userId).select("groups projects");
    //   if (!user) {
    //     return res.status(404).json({ error: "User not found" });
    //   }

    //   // Project Manager can view all tasks in the project assigned to their groups
    //   if (userRole === "super_admin") {
    //     filter = { project: { $in: user.projects } };
    //   } else {
    //     filter = {
    //       project: { $in: user.projects },
    //       _id: "6757e1b5079c9211101c2cf2",
    //     };
    //     // Regular users can only view tasks assigned to them
    //   }
    // }

    // Fetch tasks based on the filter
    const tasks = await Task.find(filter).populate("assignedTo project");
    // if (!tasks || tasks.length === 0) {
    //   return res.status(404).json({ error: "No tasks found for this project" });
    // }

    // Send response
    return res.status(200).json({
      data: tasks,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Error fetching project tasks",
      message: error.message,
    });
  }
};
export const getProjectFiles = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: "Project referrence required" });
    }
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const files = await File.find({
      associatedModelId: { $in: project.groups },
    }).populate("uploadedBy associatedModelId");
    return res.status(200).json(files);
  } catch (error: any) {
    console.error("Error fetching files:", error);
    return res
      .status(500)
      .json({ error: "Error fetching files", message: error.message });
  }
};
export const getChatProjects = async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);

    // Validate pagination parameters
    if (
      isNaN(pageNumber) ||
      pageNumber < 1 ||
      isNaN(pageLimit) ||
      pageLimit < 1
    ) {
      return res.status(400).json({
        error:
          "Invalid pagination parameters. Page and limit must be positive integers.",
      });
    }

    let filter: any;
    let totalProjects: number;

    if (req.admin) {
      // Admin: Filter by projects managed by the user
      filter = { supervisor: req.user.id };
    } else {
      // Non-admin: Filter by projects associated with the user
      const user = await User.findById(req.user.id).select("projects -_id");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      filter = { _id: { $in: user.project } };
    }

    // Fetch total project count and projects with pagination
    totalProjects = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit);

    // Send response
    return res.status(200).json({
      data: projects,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProjects / pageLimit),
      totalProjects,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Error fetching projects",
      message: error.message,
    });
  }
};

// Get a single project by ID
export const getProjectById = async (req: any, res: any) => {
  try {
    const { id } = req.params; // Project ID
    const userId = req.user.id; // Authenticated user's ID

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch the project details
    const project = await Project.findById(id).populate(
      "admin supervisor group"
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the user is related to the project
    // const isUserRelatedToProject =
    //   req.admin || // Admins can access all projects
    //   project.supervisor === userId || // Project Manager access
    //   user.projects.includes(id) || // User is directly assigned to the project
    //   (await Project.exists({ _id: id, group: { $in: user.groups } })); // User's group is part of the project

    // if (!isUserRelatedToProject) {
    //   // Unrelated users get general project data only
    //   return res.status(200).json({
    //     project: {
    //       name: project.name,
    //       description: project.description,
    //       startDate: project.startDate,
    //       endDate: project.endDate,
    //       status: project.status,
    //     },
    //     message: "You are not directly related to this project.",
    //   });
    // }

    // // If related, fetch chat rooms associated with the user and the project
    // const chatRoom = await ChatRoom.find({
    //   project: id,
    //   ...(req.admin ? {} // Admins see all chat rooms
    //     : { group: { $in: user.groups } }), // Others see only group-specific chat rooms
    // }).populate("group");

    return res.status(200).json({
      data: project,
      // chatRoom,
      message: `You are related to this project as ${
        req.admin
          ? "an Admin"
          : project.supervisor === userId
          ? "a Project Manager"
          : "a Group Member"
      }`,
    });
  } catch (error: any) {
    console.error("Error fetching project by ID:", error);
    return res
      .status(500)
      .json({ error: "Error fetching project", message: error.message });
  }
};

export const updateProject = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Destructure the status from the request body
    let updatedProject;

    // Update project based on user's role
    if (req.admin === true) {
      updatedProject = await Project.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      updatedProject = await Project.findOneAndUpdate(
        {
          _id: id,
          members: req.user.id,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
    }

    // Check if the project was found
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the status has been updated to "approved" or "declined"
    if (status === "approved" || status === "declined") {
      const notificationMessage =
        status === "approved"
          ? `Your project "${updatedProject.name}" has been approved.`
          : `Your project "${updatedProject.name}" has been declined.`;

      // Save notification to the database
      const notification = new Notification({
        recipient: updatedProject._id,
        message: notificationMessage,
      });
      await notification.save();

      // Emit real-time notification to the user
      const io = getIO();
      // io.to(updatedProject._id.toString()).emit("notification", {
      io.emit("new:notification", {
        message: notificationMessage,
      });
    }

    // Respond with the updated project
    return res.status(200).json(updatedProject);
  } catch (error: any) {
    console.error("Error updating project:", error);
    return res
      .status(500)
      .json({ error: "Error updating project", message: error.message });
  }
};

// Delete a project
export const deleteProject = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    let deletedProject;
    if (req.admin === true) {
      deletedProject = await Project.findByIdAndDelete(id);
    } else {
      deletedProject = await Project.findOneAndDelete({
        _id: id,
        groups: req.user.groupId,
      });
    }

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error deleting project", message: error.message });
  }
};
// Assign a project
export const assignProjectToGroup = async (req: any, res: any) => {
  try {
    const { groupName, projectName } = req.body;

    // Validate inputs
    if (!projectName)
      return res.status(400).json({ message: "Project reference required" });
    if (!groupName)
      return res.status(400).json({ message: "group reference required" });

    // Find the project
    const project = await Project.findOne({ name: projectName });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const groupNames = Array.isArray(groupName) ? groupName : [groupName];
    const savedgroupList: IGroup["_id"][] = [];
    const errors: string[] = [];

    // Assign project to each group
    for (const name of groupNames) {
      const group = await Group.findOne({ name });
      if (!group) {
        errors.push(`group with name ${name} not found`);
        continue;
      }

      // Check if the group is already assigned to this project
      if (project.groups.includes(group._id)) {
        errors.push(`group ${name} is already assigned to this project`);
        continue;
      }

      // Ensure no user in the group is part of another group in the same project
      const conflictinggroups = await Group.find({
        _id: { $in: project.groups },
        members: { $in: group.members },
      });
      if (conflictinggroups.length > 0) {
        errors.push(
          `group ${name} contains members already in another group for this project`
        );
        continue;
      }

      const documentation = await Documentation.create({
        projectId: project._id,
        groupId: group._id,
      });
      // Assign the project to the group
      if (!documentation) {
        return res
          .status(401)
          .json({ message: "Could not extablish a documentation channel" });
      }
      group.documentation = documentation._id;
      group.supervisor = project.supervisor;
      group.project = project._id;

      await group.save();

      // Add group ID to the project
      savedgroupList.push(group._id);

      // Initialize communication/activities model if needed
      const chatExists = await ChatRoom.findOne({
        project: project._id,
        group: group._id,
      });
      if (!chatExists) {
        await ChatRoom.create({
          name: `group_${req.user.username}_${project.name}`,
          project: project._id,
          group: group._id,
          messages: [],
          type: "group",
        });
      }
    }

    // Update the project with new groups
    project.groups.push(...savedgroupList);
    await project.save();

    // Send response
    res.status(200).json({
      message: savedgroupList.length
        ? `Project successfully assigned to groups: ${savedgroupList.join(
            ", "
          )}`
        : "No groups assigned",
      failedAssignments: errors.length ? errors : null,
      project,
    });
  } catch (error: any) {
    console.error("Error assigning project to group:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const assignProjectToStudent = async (req: any, res: any) => {
  let chatRoom;
  try {
    const { projectName } = req.params;

    // Validate project reference
    if (!projectName) return res.status(400).send("Project reference required");

    // Find the project
    const project = await Project.findOne({ name: projectName }).select(
      "_id supervisor name status members"
    );
    if (!project) return res.status(404).send("Project not found");
    if (project.status === "proposed" || !project.supervisor) {
      return res.status(400).send({ error: "Project not approved yet." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    // Check if the user is already assigned to this project
    if (user.project) {
      return res.status(409).send("User already assigned to this project");
    }

    // Create a chat room for collaboration
    chatRoom = await ChatRoom.create({
      name: `Chat_${req.user.username}_${project.name}`,
      project: project._id,
      participants: [req.user.id, project.supervisor],
      messages: [], // Initial empty chat room
    });

    if (!chatRoom) {
      throw new Error("Failed to create a collaboration room");
    }

    const group = await Group.create({
      name: `Group-${Date.now()}`,
      members: user._id,
      project: project._id,
      chatroom: chatRoom._id,
    });
    if (!group) {
      throw new Error("Failed to create a group");
    }
    // Update the user with the new project
    const documentation = await Documentation.create({
      projectId: project._id,
      groupId: group._id,
    });
    // Assign the project to the group
    if (!documentation) {
      return res
        .status(401)
        .json({ message: "Could not extablish a documentation channel" });
    }
    group.documentation = documentation._id;
    user.project = project._id;

    const savedUser = await user.save();
    if (!savedUser) {
      throw new Error("Failed to save user with assigned project");
    }

    // Update the project with the new member
    project.members.push(savedUser._id);
    const savedProject = await project.save();
    if (!savedProject) {
      throw new Error("Failed to save project with new member");
    }

    // Notify the assigned user and supervisor
    const io = getIO();

    // Notify the use
    io.to(user._id.toString()).emit("project_assigned", {
      message: `You have been assigned to the project "${project.name}".`,
      project: savedProject,
    });

    // Notify the supervisor
    io.to(project.supervisor.toString()).emit("project_assigned", {
      message: `The user "${user.username}" has been assigned to your project "${project.name}".`,
      project: savedProject,
    });

    // Success response
    return res.status(200).json({
      message:
        "Project successfully assigned to user, group created, and chat room initialized",
      project: savedProject,
      user: savedUser,
    });
  } catch (error: any) {
    if (chatRoom) {
      await ChatRoom.findByIdAndDelete(chatRoom._id); // Clean up the chat room if creation failed
    }
    return res.status(500).json({
      error: "Error assigning project to user",
      message: error.message,
    });
  }
};

export const UserChooseProject = async (req: any, res: any) => {
  let chatRoom;
  try {
    const user = await User.findById(req.user.id);
    // .populate<{
    //   group: { _id: any; project: any; documentation: any; members: string[] };
    // }>("group");
    if (!user) return res.status(404).send("User not found");

    const group = await Group.findOne({ _id: user.group }).select(
      "_id project name members documentation"
    );

    if (!group) {
      return res
        .status(409)
        .send("User should belong to a group to choose a project");
    }

    if (user.project) {
      return res.status(409).send("User is already working on a project");
    }
    const { projectName } = req.params;

    // Validate project reference
    if (!projectName) return res.status(400).send("Project reference required");

    // Find the project
    const project = await Project.findOne({ name: projectName }).select(
      "_id supervisor name status members groups"
    );
    if (!project) return res.status(404).send("Project not found");
    if (project.status === "proposed" || !project.supervisor) {
      return res.status(400).send({ error: "Project not approved yet." });
    }

    // Create a chat room for collaboration
    chatRoom = await ChatRoom.create({
      name: `Chat_${group.name}_${project.name}`,
      project: project._id,
      participants: [project.supervisor, ...group.members],
      messages: [],
      type: "group",
    });

    if (!chatRoom) {
      throw new Error("Failed to create a collaboration room");
    }

    const documentation = await Documentation.create({
      projectId: project._id,
      groupId: group._id,
    });
    // Assign the project to the user.group
    if (!documentation) {
      return res
        .status(401)
        .json({ message: "Could not extablish a documentation channel" });
    }

    group.project = project._id;
    group.documentation = documentation._id;
    // Update the user with the new project
    await group.save();

    user.project = project._id;

    const savedUser = await user.save();
    if (!savedUser) {
      throw new Error("Failed to save user with assigned project");
    }
    // Update the project with the new member
    project.groups.push(group._id);
    project.members.push(...group.members);
    const savedProject = await project.save();
    if (!savedProject) {
      throw new Error("Failed to save project with new member");
    }

    // Notify the assigned user and supervisor
    const io = getIO();

    // Notify the users
    group.members.map((member) => {
      io.to(member.toString()).emit("project_assigned", {
        message: `You have been assigned to the project "${project.name}".`,
        project: savedProject,
      });
    });

    // Notify the supervisor
    io.to(project.supervisor.toString()).emit("project_assigned", {
      message: `The user "${user.username}" has been assigned to your project "${project.name}".`,
      project: savedProject,
    });

    // Success response
    return res.status(200).json({
      message:
        "Project successfully assigned to user, group created, and chat room initialized",
      project: savedProject,
      user: savedUser,
    });
  } catch (error: any) {
    if (chatRoom) {
      await ChatRoom.findByIdAndDelete(chatRoom._id); // Clean up the chat room if creation failed
    }
    console.error(error);

    return res.status(500).json({
      error: "Error assigning project to user",
      message: error.message,
    });
  }
};
