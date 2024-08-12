const { UserHomework } = require('./models')
const users = [11, 3, 12, 13, 870, 755, 754, 871, 759, 163]
const lessons = [1, 2, 4, 5, 3, 6, 7, 8, 18, 19]
async function add() {


    await Promise.all(
        lessons.map(async (id) => {
            await UserHomework.create({
                GroupCourseId: 12,
                UserId: 163,
                HomeworkId: 26,
                LessonId: id
            })
        })
    )
}
add()
