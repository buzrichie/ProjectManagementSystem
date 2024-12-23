import ChatRoom from "../models/ChatRoomModel";
import { IProject, Project } from "../models/ProjectModel";
import { Task } from "../models/TaskModel";
import { ITeam, Team } from "../models/TeamModel";
import User from "../models/UserModel";
import { mailer } from "../utils/nodeMailer";

export const createProject = async (req: any, res: any) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      supervisor,
      team,
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
      // mailer() notification

      return res.status(201).json({
        message:
          "Project created successfully, chat room initialized for teams",
        project: proposedP,
      });
    }
    let validTeams: any[] = [];

    if (team) {
      const arrTeam = Array.isArray(team) ? team : [team];
      // await Promise.all(async()=>{
      validTeams = await Team.find({ _id: { $in: arrTeam } }).select("_id");
      // })
    }
    // Create the new project
    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      admin: req.user.id,
      supervisor,
      team: validTeams.length > 0 ? validTeams : [],
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

    // Ensure that the project has teams before initializing chat rooms
    if (newProject.team.length > 0) {
      // Initialize chat room for each team linked to the project
      for (const teamId of newProject.team) {
        // Check if a chat room already exists for the team and project
        const chatRoomExists = await ChatRoom.findOne({
          project: newProject._id,
          team: teamId,
        });

        if (!chatRoomExists) {
          // Create a new chat room if it doesn't exist
          await ChatRoom.create({
            name: `Team_${req.user.username}_${project.name}`,
            project: newProject._id,
            team: teamId,
            messages: [], // Start with an empty message array
          });
        }
      }
    }

    // Success response
    return res.status(201).json({
      message: "Project created successfully, chat room initialized for teams",
      project: newProject,
    });
  } catch (error: any) {
    console.log(error);

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

// Get Teams for specific project
export const getProjectTeams = async (req: any, res: any) => {
  try {
    const { id } = req.params; // Project ID from the route parameter
    const userId = req.user.id; // User ID from the authenticated request

    // Find the user to verify their relation to the project
    const user = await User.findById(userId).select("teams projects");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If the user is an admin, fetch all teams for the project
    if (req.admin) {
      const project = await Project.findById(id)
        .select("team -_id")
        .populate("team"); // Populate team details
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.status(200).json({
        data: project.team,
      });
    }

    // For regular users, filter teams based on their membership
    const project = await Project.findById(id)
      .select("team -_id")
      .populate({
        path: "team",
        match: { members: { $in: [userId] } }, // Filter teams where the user is a member
      });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Respond with the filtered team data
    return res.status(200).json({
      data: project.team, // Only teams the user belongs to
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Error fetching teams for the project",
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
    console.log("in");

    // Admin can access all project members
    if (req.admin) {
      console.log(req.admin);

      filter = { _id: id };
    } else {
      const user = await User.findById(userId).select("teams projects");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (req.user.role === "Manager") {
        console.log("manager");

        // Managers can see chat rooms for projects they manage

        filter = { project: { $in: user.projects } };
      } else {
        console.log(user);

        // Project Manager can access members of teams they're managing
        // if (userRole === "project_manager") {
        filter = { team: { $in: user.teams } };
        // } else {
        //   // Regular users can only access projects they belong to
        //   filter = { _id: id, "team.members": userId };
        // }
      }
    }
    console.log("here");
    console.log(filter);

    // Find the project and populate its teams
    const project = await Project.findOne(filter)
      .select("team -_id")
      .populate({
        path: "team",
        populate: { path: "members", select: "username email role status" }, // Populate members of each team
      });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    console.log(project);

    // Extract members from the populated teams
    const members = project.team.flatMap((team: any) => team.members);

    // Send response
    return res.status(200).json({
      data: members,
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
    //   const user = await User.findById(userId).select("teams projects");
    //   if (!user) {
    //     return res.status(404).json({ error: "User not found" });
    //   }

    //   // Project Manager can view all tasks in the project assigned to their teams
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
      filter = { _id: { $in: user.projects } };
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
      "admin supervisor team"
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the user is related to the project
    // const isUserRelatedToProject =
    //   req.admin || // Admins can access all projects
    //   project.supervisor === userId || // Project Manager access
    //   user.projects.includes(id) || // User is directly assigned to the project
    //   (await Project.exists({ _id: id, team: { $in: user.teams } })); // User's team is part of the project

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
    //     : { team: { $in: user.teams } }), // Others see only team-specific chat rooms
    // }).populate("team");

    return res.status(200).json({
      data: project,
      // chatRoom,
      message: `You are related to this project as ${
        req.admin
          ? "an Admin"
          : project.supervisor === userId
          ? "a Project Manager"
          : "a Team Member"
      }`,
    });
  } catch (error: any) {
    console.error("Error fetching project by ID:", error);
    return res
      .status(500)
      .json({ error: "Error fetching project", message: error.message });
  }
};

// Update a project
export const updateProject = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    let updatedProject;
    if (req.admin === true) {
      updatedProject = await Project.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      updatedProject = await Project.findOneAndUpdate(
        {
          _id: id,
          team: req.user.teamId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
    }
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json(updatedProject);
  } catch (error: any) {
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
        team: req.user.teamId,
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
export const assignProjectToTeam = async (req: any, res: any) => {
  try {
    const { teamName, projectName } = req.body;

    // Validate inputs
    if (!projectName)
      return res.status(400).json({ message: "Project reference required" });
    if (!teamName)
      return res.status(400).json({ message: "Team reference required" });

    // Find the project
    const project = await Project.findOne({ name: projectName });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const teamNames = Array.isArray(teamName) ? teamName : [teamName];
    const savedTeamList: ITeam["_id"][] = [];
    const errors: string[] = [];

    // Assign project to each team
    for (const name of teamNames) {
      const team = await Team.findOne({ name });
      if (!team) {
        errors.push(`Team with name ${name} not found`);
        continue;
      }

      // Check if the team is already assigned to this project
      if (project.team.includes(team._id)) {
        errors.push(`Team ${name} is already assigned to this project`);
        continue;
      }

      // Ensure no user in the team is part of another team in the same project
      const conflictingTeams = await Team.find({
        _id: { $in: project.team },
        members: { $in: team.members },
      });
      if (conflictingTeams.length > 0) {
        errors.push(
          `Team ${name} contains members already in another team for this project`
        );
        continue;
      }

      // Assign the project to the team
      team.supervisor = project.supervisor;
      team.project = project._id;
      await team.save();

      // Add team ID to the project
      savedTeamList.push(team._id);

      // Initialize communication/activities model if needed
      const chatExists = await ChatRoom.findOne({
        project: project._id,
        team: team._id,
      });
      if (!chatExists) {
        await ChatRoom.create({
          name: `Team_${req.user.username}_${project.name}`,
          project: project._id,
          team: team._id,
          messages: [],
        });
      }
    }

    // Update the project with new teams
    project.team.push(...savedTeamList);
    await project.save();

    // Send response
    res.status(200).json({
      message: savedTeamList.length
        ? `Project successfully assigned to teams: ${savedTeamList.join(", ")}`
        : "No teams assigned",
      failedAssignments: errors.length ? errors : null,
      project,
    });
  } catch (error: any) {
    console.error("Error assigning project to team:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Assign a project
export const assignProjectToUser = async (req: any, res: any) => {
  let team;
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
    if (user.projects.includes(project._id)) {
      return res.status(409).send("User already assigned to this project");
    }

    // Create a new team for the user and project
    // team = await Team.create({
    //   name: `Team_${req.user.username}_${project.name}`,
    //   supervisor: project.supervisor,
    //   members: [req.user.id], // Add the user to the team
    //   project: project._id,
    // });

    // if (!team) {
    //   throw new Error("Failed to create Team");
    // }

    // Create the ChatRoom for the team and project
    // const chatRoomExists = await ChatRoom.findOne({
    //   project: project._id,
    //   // team: team._id,
    // });

    // if (!chatRoomExists) {
    chatRoom = await ChatRoom.create({
      name: `Chat_${req.user.username}_${project.name}`,
      project: project._id,
      participants: [req.user.id, project.supervisor],
      // team: team._id,
      messages: [], // Initial empty chat room
    });
    // }
    if (!chatRoom) {
      throw new Error("Failed to create a collaboration room");
    }

    // Update the user with the new team and project
    // user.teams.push(team._id);
    user.projects.push(project._id);

    const savedUser = await user.save();
    if (!savedUser) {
      throw new Error("Failed to save user with assigned project");
    }

    // Add the new team to the project's team list
    // if (Array.isArray(project.team)) {
    //   project.team.push(team._id);
    // } else {
    //   project.team = [team._id];
    // }

    project.members.push(savedUser._id);
    const savedProject = await project.save();
    if (!savedProject) {
      throw new Error("Failed to save project with new team");
    }

    // Success response
    return res.status(200).json({
      message:
        "Project successfully assigned to user, team created, and chat room initialized",
      project: savedProject,
      user: savedUser,
      // team: team,
    });
  } catch (error: any) {
    // if (team) {
    //   await Team.findByIdAndDelete(team._id); // Clean up the team if creation failed
    // }
    if (chatRoom) {
      await ChatRoom.findByIdAndDelete(chatRoom._id); // Clean up the team if creation failed
    }
    return res.status(500).json({
      error: "Error assigning project to user",
      message: error.message,
    });
  }
};
