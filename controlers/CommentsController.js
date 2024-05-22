const { Comments } = require("../models");

const getAllComments = async (req, res) => {
  try {
    const {language} = req.query;

    let comments = await Comments.findAll({
      order: [
        ['id', 'DESC'],
    ],
      attributes: ['id',[`fullName_${language}`,'fullName'],[`role_${language}`,'role'],[`comment_${language}`,'comment'],'img'] ,
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
