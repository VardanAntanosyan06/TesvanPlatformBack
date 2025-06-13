const { Payment, PaymentWays, GroupsPerUsers, Groups, Users, continuingGroups } = require('../models');

function getPayMonthCount(startDate, endDate, paymentCount) {

    const start = new Date(startDate);
    const end = new Date(endDate);

    const yearsDifference = end.getFullYear() - start.getFullYear();
    const monthsDifference = end.getMonth() - start.getMonth();

    // Total number of months between the two dates


    const totalMonths = (yearsDifference * 12) + monthsDifference;
    console.log(totalMonths, 88);
    return totalMonths - (totalMonths - paymentCount)
}

function getMonthCount(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const yearsDifference = end.getFullYear() - start.getFullYear();
    const monthsDifference = end.getMonth() - start.getMonth();

    return totalMonths = (yearsDifference * 12) + monthsDifference;
}


async function startDateCourse(groupId, userId, paymentWaysStartDate) {

    const group = await Groups.findOne({
        where: {
            id: groupId
        },
        include: [
            {
                model: continuingGroups,
                as: "lastGroup",
                require: false
            }
        ]
    });
    let courseStartDate
    if (group.lastGroup) {
        const lastCoursePayment = await Payment.findAll({
            where: {
                userId,
                groupId: group.lastGroup?.lastGroupId,
                status: "Success"
            }
        })

        let lastCourse = await PaymentWays.findOne({
            where: {
                groupId: group.lastGroup?.lastGroupId,
                type: "monthly",
            },
        });

        if (!lastCourse) {
            lastCourse = await PaymentWays.findOne({
                where: {
                    groupId: group.lastGroup?.lastGroupId,
                    type: "full",
                },
            });
        }

        const lastGroup = await GroupsPerUsers.findOne({
            where: {
                groupId: group.lastGroup?.lastGroupId,
                userId,
                userRole: "STUDENT"
            }
        })


        if (lastGroup && group.lastGroup && (lastCoursePayment[0].type === "full" || lastCoursePayment.length >= lastCourse.durationMonths)) {
            courseStartDate = new Date(paymentWaysStartDate);
            courseStartDate.setMonth(courseStartDate.getMonth() + 1);
        } else {
            courseStartDate = paymentWaysStartDate
        };
    } else {
        courseStartDate = paymentWaysStartDate
    }
    return courseStartDate
}

const courseBlock = async (groupId, userId) => {
    try {

        const user = await Users.findByPk(userId);
        if (user.role === "ADMIN") {
            return false
        }

        const payments = await Payment.findAll({
            where: {
                userId,
                groupId,
                status: "Success",
            },
            attributes: ['id', 'paymentWay', 'status', 'type', 'amount', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        let paymentWays = await PaymentWays.findOne({
            where: {
                groupId,
                type: "monthly",
            },
            include: [
                {
                    model: Groups,
                    as: "group"
                }
            ]
        });

        if (!paymentWays) {
            paymentWays = await PaymentWays.findOne({
                where: {
                    groupId,
                    type: "full",
                },
                include: [
                    {
                        model: Groups,
                        as: "group"
                    }
                ]
            });
        }


        const startGroupDate = await startDateCourse(groupId, userId, paymentWays.group.startDate)

        if (payments.length === 0) {
            return true;
        };

        if (payments[0].type === 'full') {
            return false;
        };

        const durationMonths = getPayMonthCount(startGroupDate, paymentWays.group.endDate, payments.length);
        let nextPaymentDate = new Date(startGroupDate);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + durationMonths);
        if (new Date() > nextPaymentDate) {
            if (paymentWays.group.endDate < new Date() && (getMonthCount(await startDateCourse(groupId, userId, paymentWays.group.startDate), paymentWays.group.endDate) === payments.length)) {
                throw new Error("")
            }
            return true
        }

        return false;

    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = { courseBlock };
