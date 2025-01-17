import { Project } from "../models/ProjectModel";
import { Notification } from "../models/NotificationModel";
import dayjs from "dayjs"; // For date manipulation
import { mailer } from "./nodeMailer";

export const sendDeadlineNotifications = async () => {
  try {
    // Define the timeframes for notifications
    const now = dayjs();
    const oneDayFromNow = now.add(1, "day").toDate();
    const threeDaysFromNow = now.add(3, "days").toDate();

    // Find projects with deadlines in the next 1 and 3 days
    const projects = await Project.find({
      endDate: { $gte: now.toDate(), $lte: threeDaysFromNow },
    }).populate("members", "email username"); // Populate project members for notification

    for (const project of projects) {
      const isDueInOneDay = dayjs(project.endDate).isBefore(oneDayFromNow);
      const timeFrame = isDueInOneDay ? "1 day" : "3 days";

      // Create and send notifications to all project members
      for (const member of project.members) {
        const notificationMessage = `Reminder: The project "${project.name}" is due in ${timeFrame}. Please ensure all tasks are completed on time.`;

        // Save the notification to the database
        await Notification.create({
          user: member._id,
          project: project._id,
          message: notificationMessage,
          read: false,
          createdAt: new Date(),
        });

        // Optionally, send an email to the user
        if (member.email) {
          await mailer(
            process.env.MAILER_USER ? process.env.MAILER_USER : "",
            member.email,
            `Project Deadline Reminder: ${project.name}`,
            notificationMessage
          );
        }

        // console.log(`Notification sent to ${member.username || member.email}`);
      }
    }
  } catch (error) {
    console.error("Error sending deadline notifications:", error);
  }
};
