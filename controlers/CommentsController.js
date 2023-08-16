const { Comments } = require("../models");

const getAllComments = async (req, res) => {
  try {
    let comments = await Comments.findAll({
      order: [
        ['createdAt', 'DESC'],
    ],
      attributes: { exclude: ["id", "updatedAt"] },
    });
    return res.status(200).json({ comments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  getAllComments,
};
