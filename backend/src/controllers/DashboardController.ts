import User from "../models/UserModel";
import { Project } from "../models/ProjectModel";
import { Group } from "../models/GroupModel";
import { Documentation } from "../models/DocumentationModel";
import { Chapter } from "../models/ChapterModel";

export const getDashboard = async (req: any, res: any) => {
  try {
    const userId = req.user.id; // Authenticated user's ID
    const user = await User.findById(userId).populate("project group");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let responseData: any = { role: user.role };

    switch (user.role) {
      case "admin":
      case "super_admin":
      case "hod":
        responseData = {
          ...responseData,
          statistics: {
            totalUsers: await User.countDocuments(),
            totalProjects: await Project.countDocuments(),
            totalGroups: await Group.countDocuments(),
            activeUsers: await User.countDocuments({ status: "active" }),
            inactiveUsers: await User.countDocuments({ status: "inactive" }),
            pendingProjects: await Project.countDocuments({
              status: "proposed",
            }),
            totalSupevisedStudents: await User.countDocuments({
              supervisor: userId,
            }),
            totalSupevisedProjects: await Project.countDocuments({
              supervisor: userId,
            }),
            totalSupevisedGroups: await Group.countDocuments({
              supervisor: userId,
            }),
          },
          latestUsers: await User.find().sort({ createdAt: -1 }).limit(5),
          latestProjects: await Project.find().sort({ createdAt: -1 }).limit(5),
          pendingApprovals: {
            projects: await Project.find({ status: "proposed" }).populate(
              "proposedUser"
            ),
            // users: await User.find({ status: "pending" }),
          },
        };
        break;

      case "student":
        responseData = {
          ...responseData,
          myProject: await Project.findOne({ members: user._id }).populate(
            "supervisor"
          ),
          myGroup: await Group.findOne({ members: user._id }).populate(
            "supervisor"
          ),
          documentationStatus:
            user.project && "_id" in user.project
              ? await Documentation.find({
                  projectId: user.project._id,
                }).populate("chapters")
              : user.project
              ? await Documentation.find({ projectId: user.project }).populate(
                  "chapter"
                )
              : null,
          assignedTasks: await Project.find({ task: { $in: user.task } }),
          proposedProjects: await Project.find({ proposedUser: userId }),
          latestProjects: await Project.find({ status: "approved" })
            .sort({ createdAt: -1 })
            .limit(2),
        };
        break;

      case "supervisor":
        responseData = {
          ...responseData,
          statistics: {
            totalSupevisedStudents: await User.countDocuments({
              supervisor: userId,
            }),
            totalSupevisedProjects: await Project.countDocuments({
              supervisor: userId,
            }),
            totalSupevisedGroups: await Group.countDocuments({
              supervisor: userId,
            }),
            activeUsers: await User.countDocuments({ status: "active" }),
            inactiveUsers: await User.countDocuments({ status: "inactive" }),
          },
          supervisedProjects: await Project.find({
            supervisor: user._id,
          }).populate("members"),
          supervisedGroups: await Group.find({ supervisor: user._id }).populate(
            "members"
          ),
          latestProjects: await Project.find({ status: "approved" })
            .sort({ createdAt: -1 })
            .limit(5),
          // documentationReviews: await Documentation.find({}),
        };
        break;

      // case "hod":
      //   responseData = {
      //     ...responseData,
      //     departmentProjects: await Project.find({
      //       department: user.profile?.department,
      //     }).populate("members supervisor"),
      //     departmentGroups: await Group.find({}).populate("members"),
      //     pendingApprovals: {
      //       projects: await Project.find({
      //         status: "proposed",
      //         department: user.profile?.department,
      //       }),
      //     },
      //   };
      //   break;

      case "project_coordinator":
        responseData = {
          ...responseData,
          statistics: {
            totalUsers: await User.countDocuments(),
            totalProjects: await Project.countDocuments(),
            totalGroups: await Group.countDocuments(),
            pendingProjects: await Project.countDocuments({
              status: "proposed",
            }),
          },
          allProjects: await Project.find({}).populate("members supervisor"),
          allGroups: await Group.find({}).populate("members supervisor"),
          documentationSubmissions: await Documentation.find({}),
        };
        break;

      default:
        responseData = {
          ...responseData,
          message: "Dashboard not available for this role",
        };
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
