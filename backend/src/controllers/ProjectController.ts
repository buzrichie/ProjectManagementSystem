import { IProject, Project } from "../models/ProjectModel";
import { ITeam, Team } from "../models/TeamModel";
import User from "../models/UserModel";

// Create a new project
export const createProject = async (req: any, res: any) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      projectManager,
      team,
      status,
    } = req.body;

    const project: IProject = new Project({
      name,
      description,
      startDate,
      endDate,
      admin: req.user.id,
      projectManager,
      team: team ? team : [],
      status,
    });

    const newProject = await project.save();
    return res.status(201).json(newProject);
  } catch (error: any) {
    console.log(error);

    return res
      .status(500)
      .json({ error: "Error creating project", message: error.message });
  }
};

export const getProjects = async (req: any, res: any) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    // Set up the search query based on admin status and search term
    const searchQuery: any = {
      ...{},
      ...(query ? { name: { $regex: new RegExp(query as string, "i") } } : {}), // Optional search by name
    };

    // Fetch projects with pagination
    const projects = await Project.find(searchQuery)
      .select("name description team status") // Adjust fields as needed
      .skip((+page - 1) * +limit)
      .limit(+limit);

    // Get total count of projects for pagination metadata
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

export const getChatProjects = async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);

    // Validate page and limit values
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

    let projects;
    let totalProjects;

    if (req.admin) {
      // Admin: Fetch projects managed by the user
      totalProjects = await Project.countDocuments({
        projectManager: req.user.id,
      });
      projects = await Project.find({ projectManager: req.user.id })
        .skip((pageNumber - 1) * pageLimit)
        .limit(pageLimit);
    } else {
      // Non-admin: Fetch projects associated with the user
      const user = await User.findById(req.user.id)
        .select("projects -_id")
        .populate("projects");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      totalProjects = user.projects?.length || 0;
      projects = user.projects.slice(
        (pageNumber - 1) * pageLimit,
        pageNumber * pageLimit
      );
    }

    // Send response with data and pagination details
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
    const { id } = req.params;
    let project;
    if (req.admin === true) {
      project = await Project.findById(id)
        .populate("admin projectManager team")
        .select("-password -role");
    } else {
      project = await Project.findOne({
        _id: id,
        team: req.user.teamId,
      })
        .populate("admin projectManager team")
        .select("-password -role");
    }
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json(project);
  } catch (error: any) {
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

    // Validate projectId and teamId
    if (!projectName) return res.status(400).send("Project reference required");
    if (!teamName) return res.status(400).send("Team reference required");

    // Find the project
    const project = await Project.findOne({ name: projectName });
    if (!project) return res.status(404).send("Project not found");

    // Initialize team list to be assigned to the project
    const savedTeamList: ITeam["_id"][] = [];

    // Ensure teamId is treated as an array for mapping
    const teamNames = Array.isArray(teamName) ? teamName : [teamName];

    // Fetch each team and assign the project
    const teamAssignments = await Promise.all(
      teamNames.map(async (value) => {
        const team = await Team.findOne({ name: value });
        if (!team) return { error: `Team with name ${value} not found` };
        console.log(team);
        console.log(project);

        if (project.team.includes(team._id)) {
          return { error: `Team with ID ${value} already exist.` };
        }
        team.projectManager = project.projectManager;
        team.project = project._id;
        await team.save();
        savedTeamList.push(team._id);
      })
    );

    // Check for any errors in team assignments
    const assignmentErrors = teamAssignments.filter((result) => result?.error);
    if (assignmentErrors.length > 0 && savedTeamList.length < 1) {
      return res
        .status(404)
        .json({ message: assignmentErrors.map((e) => e!.error).join(", ") });
    }

    // Update the project with new team assignments
    project.team.push(...savedTeamList);

    // Save the updated project
    const savedProject = await project.save();
    if (!savedProject) {
      return res.status(500).json({
        message: "Could not assign Project to Team",
      });
    }

    // Success response
    return res.status(200).json({
      message: `Project ${savedTeamList
        .map((e) => e)
        .join(", ")} assigned successfully`,
      failed:
        assignmentErrors.length > 0 &&
        assignmentErrors.map((e) => e!.error).join(", "),
      project: savedProject,
    });
  } catch (error: any) {
    console.log(error);

    return res
      .status(500)
      .json({ error: "Error assigning project", message: error.message });
  }
};
// Assign a project
export const assignProjectToUser = async (req: any, res: any) => {
  let team;
  try {
    const { projectName } = req.params;

    // Validate projectId and teamId
    if (!projectName) return res.status(400).send("Project reference required");

    // Find the project
    const project = await Project.findOne({ name: projectName }).select(
      "_id projectManager team name"
    );
    if (!project) return res.status(404).send("Project not found");

    const user = await User.findById(req.user.id);
    if (!user) return { error: `Team with name ${user} not found` };
    // Fetch each team and assign the project
    if (user.projects.includes(project._id))
      return res.status(404).send("User already assigned to team");

    team = await Team.create({
      name: `Team_${req.user.username}_${project.name}`,
      projectManager: project.projectManager,
      members: req.user.id,
      project: project._id,
    });
    if (!team) {
      throw Error("Faided to create Team");
    }

    console.log(user);

    user.teams.push(team._id);
    user.projects.push(project._id);
    const savedUser = await user.save();
    if (!savedUser) {
      return res.status(500).json("Error assigning Project to User");
    }
    // Update the project with new team assignments

    Array.isArray(project.team)
      ? project.team.push(team._id)
      : (project.team = [team._id]);

    // Save the updated project
    const savedProject = await project.save();
    if (!savedProject) {
      return res.status(500).json("Error assigning Project to Team");
    }

    // Success response
    return res.status(200).json({
      project: savedProject,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json("Duplicate Error");
    }
    if (team) {
      await Team.findByIdAndDelete(team._id);
    }
    return res.status(500).json({
      error: "Error assigning project to user",
      message: error.message,
    });
  }
};
