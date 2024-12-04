import { Team } from "../models/TeamModel"; // Make sure the path is correct
import User, { IUser } from "../models/UserModel";

// Create a new team
export const createTeam = async (req: any, res: any) => {
  try {
    const { name, members, projectManager, project } = req.body;
    let arrayMembers;
    if (Array.isArray(members)) {
      arrayMembers = members;
    } else {
      arrayMembers = [members];
    }

    const membersIds: IUser["_id"][] = [];
    await Promise.all(
      arrayMembers.map(async (member) => {
        try {
          const user = await User.findOne({ username: member }).select("_id");
          if (!user) {
            return;
          }
          membersIds.push(user._id);
        } catch (error) {
          return;
        }
      })
    );
    if (membersIds.length < 1) {
      return res.status(404).json({ message: "user(s) not found" });
    }

    const manager = await User.findOne({ username: projectManager }).select(
      "_id"
    );
    if (!manager) {
      return res.status(404).json({ message: "Project Manager not found" });
    }

    const team = new Team({
      name,
      members: membersIds,
      projectManager: manager ? manager._id : null,
      project: project ? project : null,
    });

    const newTeam = await team.save();
    return res.status(201).json(newTeam);
  } catch (error: any) {
    console.error({ error: "Error creating team", message: error.message });
    return res
      .status(500)
      .json({ error: "Error creating team", message: error.message });
  }
};

// Get all teams
export const getTeams = async (req: any, res: any) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    // Set up basic query object
    const searchQuery: any = query
      ? { name: { $regex: new RegExp(query as string, "i") } }
      : {};

    // Fetch teams with pagination
    const teams = await Team.find(searchQuery)
      .select("name") // only fetch the 'name' field
      .skip((+page - 1) * +limit)
      .limit(+limit);

    // Get total count for pagination
    const totalTeams = await Team.countDocuments(searchQuery);

    // Send response with pagination metadata
    res.json({
      data: teams,
      currentPage: +page,
      totalPages: Math.ceil(totalTeams / +limit),
      totalTeams,
    });
  } catch (error: any) {
    console.error({ error: "Error fetching team", message: error.message });
    res
      .status(500)
      .json({ message: "Error fetching teams", error: error.message });
  }
};

// Get a single team by ID
export const getTeamById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id).populate("members");
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    return res.status(200).json(team);
  } catch (error: any) {
    console.error({ error: "Error fetching team", message: error.message });
    return res
      .status(500)
      .json({ error: "Error fetching team", message: error.message });
  }
};

// Update a team
export const updateTeam = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedTeam = await Team.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("members");
    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }
    return res.status(200).json(updatedTeam);
  } catch (error: any) {
    console.error({ error: "Error updating team", message: error.message });
    return res
      .status(500)
      .json({ error: "Error updating team", message: error.message });
  }
};

// Delete a team
export const deleteTeam = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    let deletedTeam;
    if (req.admin === true) {
      deletedTeam = await Team.findByIdAndDelete(id);
    } else {
      deletedTeam = await Team.findOneAndDelete({
        _id: id,
        projectManager: req.user._id,
      });
    }
    if (!deletedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }
    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error: any) {
    console.error({ error: "Error deleting team", message: error.message });
    return res
      .status(500)
      .json({ error: "Error deleting team", message: error.message });
  }
};
