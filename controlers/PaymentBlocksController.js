// const { PaymentBlocks, GroupCourses } = require('../models');

// const PaymentCreate = async (req, res) => {
//   try {
//     const { id, title, description, price, type } = req.body;
//     const course = await GroupCourses.findOne({
//       where: {
//         id,
//       },
//     });
//     if (!course) {
//       return res.status(404).json({ message: 'No Course with this Id' });
//     }

//     return res.send(payment);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: 'Something Went Wrong' });
//   }
// };
