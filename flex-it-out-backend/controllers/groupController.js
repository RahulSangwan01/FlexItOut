const Group = require("../models/group");
const User = require("../models/User");

// ✅ Create a New Group
exports.createGroup = async (req, res) => {
    try {
      const { name, roomId } = req.body;
  
      const newGroup = new Group({
        name,
        members: [],
        messages: [],
        roomId
      });
  
      await newGroup.save();
      res.status(201).json(newGroup);
    } catch (error) {
      res.status(500).json({ error: "Failed to create group" });
    }
}  

// ✅ Get All Groups
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("members", "username");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

exports.getGroupMessages = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate({
                path: "messages.sender",
                select: "name",
            })
            .populate("members", "name");

        if (!group) return res.status(404).json({ error: "Group not found" });

        const isMember = group.members.some(member => member._id.toString() === req.user.id);

        res.json({
            ...group.toObject(),
            isMember,
            roomId: group.roomId,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch group messages" })
    }
}

// ✅ Send Message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, text } = req.body;

    if (!senderId || !text) {
      return res.status(400).json({ error: "Sender ID or text is missing" });
    }

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Fetch sender's username
    const sender = await User.findById(senderId).select("username");
    if (!sender) return res.status(404).json({ error: "User not found" });

    const newMessage = {
      sender: { _id: senderId, username: sender.username }, // ✅ Ensure username is included
      text,
    };

    group.messages.push(newMessage);
    await group.save();

    res.json(newMessage); // ✅ Return message with sender username
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// ✅ Join a Group
exports.joinGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.members.includes(userId)) {
      return res.status(400).json({ error: "User already in the group" });
    }

    group.members.push(userId);
    await group.save();

    res.json({ message: "Joined group successfully", group });
  } catch (error) {
    res.status(500).json({ error: "Failed to join group" });
  }
};

// ✅ Leave a Group
exports.leaveGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members = group.members.filter((member) => member.toString() !== userId);
    await group.save();

    res.json({ message: "Left group successfully", group });
  } catch (error) {
    res.status(500).json({ error: "Failed to leave group" });
  }
};
