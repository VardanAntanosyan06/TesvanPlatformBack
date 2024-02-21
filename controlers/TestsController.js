const { Tests,TestsQuizz,TestsQuizzOptions } = require("../models");

const createTest = async (req, res) => {
  try {
    const {
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      courseId,
    } = req.body;

    const task = await Tests.create({
      title_en,
      title_ru,
      title_am,
      description_en,
      description_ru,
      description_am,
      courseId,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const createQuizz = async (req, res) => {
  try {
    const {title,description,courseId,language,type,time,percent,questions} = req.body;

    let {id:testId} = await Tests.create({
      title,
      description,
      courseId,
      language,
      type,
      time,
      percent,
    })
    questions.map((e)=>{
       TestsQuizz.create({
        question:e.question,
        testId,
        language:e.language
      }).then((data)=>{
        e.options.map((i)=>{
          TestsQuizzOptions.create({
          questionId:data.id,
          option:i.option,
          isCorrect: i.isCorrect
        })
      })
      })
    })

    return res.status(200).json({success:true})
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
const findTest = async (req, res) => {
  try {
    const {id} = req.params;
    const test = await Tests.findOne({ where: {id},include:[{model:TestsQuizz,include:[TestsQuizzOptions]}]});

    if(!test) return res.status(403).json({success:false,message:`with ID ${id} Test not found`})
 
    return res.status(200).json({success:true,test})
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const findAll = async (req, res) => {
  try {
    const task = await Model.findAll({ where: {} });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const update = async (req, res) => {
  try {
    const task = await Model.update({ where: {} });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const remove = async (req, res) => {
  try {
    const task = await Model.destroy({ where: {} });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


module.exports ={
  createQuizz,
  findTest
}