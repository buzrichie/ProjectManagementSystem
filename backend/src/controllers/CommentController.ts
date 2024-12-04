import { Comment } from "../models/CommentModel"; // Ensure the path to the Comment model is correct

// Create a new comment
export const createComment = async (req: any, res: any) => {
  try {
    const { user, task, content } = req.body;

    const comment = new Comment({
      user,
      task,
      content,
    });

    const newComment = await comment.save();
    return res.status(201).json(newComment);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error creating comment", message: error.message });
  }
};

// Get all comments for a task
export const getCommentsByTask = async (req: any, res: any) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ task: taskId }).populate("user task");
    return res.status(200).json(comments);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching comments", message: error.message });
  }
};

// Get a single comment by ID
export const getCommentById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id).populate("user task");
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json(comment);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching comment", message: error.message });
  }
};

// Update a comment by ID
export const updateComment = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedComment = await Comment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("user task");
    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json(updatedComment);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error updating comment", message: error.message });
  }
};

// Delete a comment by ID
export const deleteComment = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error deleting comment", message: error.message });
  }
};
