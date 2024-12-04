import { Bid } from "../models/BidModel"; // Ensure the path to the Bid model is correct

// Create a new bid
export const createBid = async (req: any, res: any) => {
  try {
    const { amount, bidder, task, description } = req.body;

    const bid = new Bid({
      amount,
      user: bidder,
      task,
      description,
    });

    const newBid = await bid.save();
    return res.status(201).json(newBid);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error creating bid", message: error.message });
  }
};

// Get all bids
export const getBids = async (req: any, res: any) => {
  try {
    const bids = await Bid.find().populate("bidder task");
    return res.status(200).json(bids);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching bids", message: error.message });
  }
};

// Get a single bid by ID
export const getBidById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const bid = await Bid.findById(id).populate("bidder task");
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }
    return res.status(200).json(bid);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching bid", message: error.message });
  }
};

// Update a bid
export const updateBid = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedBid = await Bid.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("bidder task");
    if (!updatedBid) {
      return res.status(404).json({ message: "Bid not found" });
    }
    return res.status(200).json(updatedBid);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error updating bid", message: error.message });
  }
};

// Delete a bid
export const deleteBid = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    let deletedBid;
    if (req.admin === true) {
      deletedBid = await Bid.findByIdAndDelete(id);
    } else {
      deletedBid = await Bid.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });
    }
    if (!deletedBid) {
      return res.status(404).json({ message: "Bid not found" });
    }
    return res.status(200).json({ message: "Bid deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error deleting bid", message: error.message });
  }
};
