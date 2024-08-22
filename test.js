const { UserHomework } = require('./models')
const users = [ 3, 163, 754, 900, 907, 890, 879]
const lessons = [1, 2, 4, 5, 3, 6, 7, 8, 18, 19]
async function add() {


    await Promise.all(
        lessons.map(async (id) => {
            await UserHomework.create({
                GroupCourseId: 12,
                UserId: 900,
                HomeworkId: 0,
                LessonId: id
            })
        })
    )
}
add()
