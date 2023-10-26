const LeaveApplication = require('../../models/leave/leave-model');
const userModel = require('../../models/user/user-model')
const LeaveType = require("../../models/leave/leave-type-model");
const Holiday = require("../../models/leave/holiday-model");
const holidayValidation = require("../../models/leave/holidayValidation");
const leaveValidation = require("../../models/leave/leaveValidation");
const config = require("../../config/config");
const {
    sendEmail
} = require('../../common/mailer');
const Leaves = require('../../models/leave/leave-rule-model');
const {
    logInfo
} = require('../../common/logger');
const dateUtil = require('../../utils/date-util');
var pascalCase = require('pascal-case')
var holidayList = [];


//Get all Leave Types
exports.leaveTypes_get_all = ((request, response) => {
    LeaveType.find({
        isActive: "true"
    }).then((result) => {

        response.json(result);

    }).catch((err) => {
        response.json({
            success: false,
            msg: `Something went wrong ${err}`
        });
    })
})


exports.getUserOnLeaveDetails = ((request, response) => {
    //console.log("getUserOnLeaveDetails server", request.body);
    let todaysDate = dateUtil.DateToString(new Date());
    let userId = request.body.userId
    LeaveApplication.find({
        isDeleted: false,
        userId: userId
    }, {
            "_id": 1,
            "leaveType": 1,
            "status": 1,
            "userName": 1,
            "fromEmail": 1,
            "fromDate": 1,
            "toDate": 1,
            "workingDays": 1,
            "createdOn": 1,
            "leaveWithoutApproval": 1
        }).then((result) => {
            // console.log("result", result);
            let checkValue = false
            if (result.length > 0) {

                for (let i = 0; i < result.length; i++) {
                    let startDate = dateUtil.DateToString(result[i].fromDate);
                    // console.log("startDate", startDate);
                    let endDate = dateUtil.DateToString(result[i].toDate);
                    // console.log("endDate", endDate);
                    // console.log("todaysDate", todaysDate)
                    if (startDate === todaysDate || endDate === todaysDate) {
                        // console.log("truse",[i]);
                        checkValue = true
                    }
                }
            }
            if (checkValue === true) {
                response.json({
                    data: 'On Leave',
                });
            }
            else {
                response.json({
                    data: '',
                });
            }
        }).catch((err) => {
            response.json({
                success: false,
                msg: `Something went wrong ${err}`
            });
        })
})

//getall leave for admin 
exports.getAllAppliedLeavesforAdmin = ((request, response) => {
    // console.log("getAllAppliedLeavesforAdmin server");
    LeaveApplication.find({
        isDeleted: false
    }, {
            "_id": 1,
            "leaveType": 1,
            "status": 1,
            "createdOn": 1,
            "userName": 1,
            "fromEmail": 1,
            "fromDate": 1,
            "toDate": 1,
            "workingDays": 1,
            "leaveWithoutApproval": 1
        }).then((result) => {
            // console.log("result", result);
            let finalResult = result.map((r) => {
                let createdOn=dateUtil.DateToString(r.createdOn);
                
                let leave = {
                    leaveId: r._id,
                    userName: r.userName,
                    createdOn: createdOn,
                    fromEmail: r.fromEmail,
                    fromDate: r.fromDate,
                    toDate: r.toDate,
                    workingDays: r.workingDays,
                    leaveType: r.leaveType,
                    status: pascalCase(r.status),
                    leaveWithoutApproval: r.leaveWithoutApproval
                }
                return leave;
            })
            response.json(finalResult);

        }).catch((err) => {
            response.json({
                success: false,
                msg: `Something went wrong ${err}`
            });
        })
})

// Save the leave application

exports.leaveApplicationSave = ((request, response) => {
    let newLeaveApplication = new LeaveApplication({
        userId: request.body.leaveApplication.createdBy,
        userName: request.body.leaveApplication.userName,
        fromEmail: request.body.leaveApplication.fromEmail,
        fromDate: request.body.leaveApplication.fromDate,
        toDate: request.body.leaveApplication.toDate,
        workingDays: request.body.leaveApplication.workingDays,
        reason: request.body.leaveApplication.reason,
        leaveTypeId: request.body.leaveApplication.leaveTypeId,
        leaveType: request.body.leaveApplication.leaveType,
        createdBy: request.body.leaveApplication.createdBy,
        createdOn: request.body.leaveApplication.createdOn,
        modifiedBy: request.body.leaveApplication.modifiedBy,
        modifiedOn: request.body.leaveApplication.modifiedOn,
        leaveCategory: request.body.leaveApplication.leaveCategory,
        isDeleted: request.body.leaveApplication.isDeleted,
        status: "pending",
        rejectionReason: '',
        leaveWithoutApproval: request.body.leaveWithoutApproval
    })
    let inputFromDate = Date.parse(newLeaveApplication.fromDate);
    let inputToDate = Date.parse(newLeaveApplication.toDate);
    let newFromDate = new Date(inputFromDate);
    let newToDate = new Date(inputToDate);
    let date = 1,
        month = 1,
        year = 1;
    date = newToDate.getDate();
    month = newToDate.getMonth();
    year = newToDate.getFullYear();
    holidayValidation.init(newFromDate, config.totalCasualLeaves, config.totalSickLeaves);
    let message = 1;

    newLeaveApplication.save()
        .then((result) => {
            logInfo(result, "Applied for leave");
            let loggedInUserId = request.userInfo.userId;
            let reportingManagerId = 1;
            let toEmail = 1;
            let bodyHtml = config.leaveEmailContent;
            let subject = config.leaveSubject;
            let leaveType = 1;
            bodyHtml = bodyHtml.replace("{fromDate}", request.body.leaveApplication.fromDate);
            bodyHtml = bodyHtml.replace("{toDate}", request.body.leaveApplication.toDate);
            bodyHtml = bodyHtml.replace("{workingDays}", request.body.leaveApplication.workingDays);
            bodyHtml = bodyHtml.replace("{leaveType}", request.body.leaveApplication.leaveType);
            bodyHtml = bodyHtml.replace("{reason}", request.body.leaveApplication.reason);
            bodyHtml = bodyHtml.replace("{leaveId}", result._id)
           // bodyHtml = bodyHtml.replace("{userName}", request.body.leaveApplication.userName);

            subject = subject.replace("{fromDate}", request.body.leaveApplication.fromDate)
                .replace("{toDate}", request.body.leaveApplication.toDate)
                .replace("{userName}", request.body.leaveApplication.userName);
            var mailOptions = {
                from: request.body.leaveApplication.fromEmail,
                to: 1,
                subject: subject,
                html: bodyHtml
            };
            if (config.prodMode === "ON") {
                userModel.findOne({
                    "_id": loggedInUserId
                }, {
                        "reportingManagerId": 1
                    }).then((result) => {
                        reportingManagerId = result.reportingManagerId;
                        userModel.findOne({
                            "_id": reportingManagerId
                        }, {}).then((result) => {
                            if (result) {
                                toEmail = result.email;
                                mailOptions.to = toEmail;
                                mailOptions.cc = config.applytoEmail;
                                let response = sendEmail(mailOptions);
                                if (response.response) {
                                    logInfo(response, 'leaveController.leaveApplicationSave - Error occured while sending email ' + mailOptions.to);
                                } else {
                                    logInfo('leaveController.leaveApplicationSave - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');
                                }
                            }

                        })
                    });

            } else {
                toEmail = config.defaultEmail;
                mailOptions.to = toEmail;
                let response = sendEmail(mailOptions);
                if (response.response) {
                    logInfo(response, 'leaveController.leaveApplicationSave - Error occured while sending email ' + mailOptions.to);
                    response.json({
                        success: false,
                        err: "Something went wrong : Email Id is wrong for sending to."
                    })
                } else {
                    logInfo('leaveController.leaveApplicationSave - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');

                }
            }

        });
    response.json({
        success: true,
        message: "Leave has been applied successfully." //+ message
    });
});

exports.getAllLeaves = ((request, response) => {
    // checking for current logged in user details
    //now setting some variables for userId and userRole
    let loggedInUserRole = request.userInfo.userRole;
    let loggedInUserId = request.userInfo.userId;
    let appliedLeaves = [];
    let userAppliedLeaves = [];
    if (loggedInUserRole !== "user") {
        // logic for getting resulted data on the basis of role such as admin or owner
        LeaveApplication.find({
            userId: loggedInUserId,
            isDeleted: false
        }, {
                "_id": 1,
                "leaveType": 1,
                "status": 1,
                "userName": 1,
                "fromEmail": 1,
                "fromDate": 1,
                "toDate": 1,
                "workingDays": 1,
                "leaveWithoutApproval": 1,
                "createdOn": 1
            }).then((result) => {
                //checking for result in console.

                if (request.body.flag === 'applied') {
                    if (result.length > 0) {
                        for (let value = 0; value < result.length; value++) {
                            let createdOn=dateUtil.DateToString(result[value].createdOn);
                            
                            appliedLeaves.push({
                                leaveId: result[value]._id,
                                leaveType: result[value].leaveType,
                                createdOn: createdOn,
                                status: pascalCase(result[value].status),
                                fromDate: result[value].fromDate,
                                toDate: result[value].toDate,
                                workingDays: result[value].workingDays,
                                leaveWithoutApproval: result[value].leaveWithoutApproval
                            });
                        }
                        response.json({ success: true, appliedLeaves: appliedLeaves, userAppliedLeaves: [] })
                    }
                }

                // else if (request.body.flag !== 'applied') {
                else {
                    userModel.find({
                        reportingManagerId: loggedInUserId
                    }).then((result) => {
                        var userIds = [];
                        for (let i = 0; i < result.length; i++) {
                            userIds.push(result[i]._id);
                        }

                        LeaveApplication.find({
                            userId: {
                                $in: userIds
                            },
                            status: request.body.flag === 'pending' ? request.body.flag : { $in: ['approved', 'rejected'] },
                            isDeleted: false
                        }, {
                                "_id": 1,
                                "leaveType": 1,
                                "status": 1,
                                "createdOn": 1,
                                "userName": 1,
                                "fromEmail": 1,
                                "fromDate": 1,
                                "toDate": 1,
                                "workingDays": 1,
                                "leaveWithoutApproval": 1
                            }).then((result) => {
                                //checking for result in console.
                                if (result.length > 0) {
                                    for (let value = 0; value < result.length; value++) {
                                        let createdOn=dateUtil.DateToString(result[value].createdOn);
                                       
                                        userAppliedLeaves.push({
                                            leaveId: result[value]._id,
                                            leaveType: result[value].leaveType,
                                            status: pascalCase(result[value].status),
                                            userName: result[value].userName,
                                            fromEmail: result[value].fromEmail,
                                            createdOn: createdOn,
                                            fromDate: result[value].fromDate,
                                            toDate: result[value].toDate,
                                            workingDays: result[value].workingDays,
                                            leaveWithoutApproval: result[value].leaveWithoutApproval
                                        });
                                    }
                                }
                                response.json({
                                    success: true,
                                    appliedLeaves: [],
                                    userAppliedLeaves: userAppliedLeaves
                                })

                            });
                    })
                }
                // else {
                //     response.json({
                //         success: true,
                //         appliedLeaves: [],
                //         userAppliedLeaves: []
                //     })
                // }


            })
    } else {
        LeaveApplication.find({
            userId: loggedInUserId,
            isDeleted: false
        }, {
                "_id": 1,
                "leaveType": 1,
                "status": 1,
                "createdOn": 1,
                "userName": 1,
                "fromEmail": 1,
                "fromDate": 1,
                "toDate": 1,
                "workingDays": 1,
                "leaveWithoutApproval": 1
            }).then((result) => {
                if (result.length > 0) {
                    for (let value = 0; value < result.length; value++) {
                        let createdOn=dateUtil.DateToString(result[value].createdOn);
                        appliedLeaves.push({
                            leaveId: result[value]._id,
                            leaveType: result[value].leaveType,
                            createdOn: createdOn,
                            status: pascalCase(result[value].status),
                            userName: result[value].userName,
                            fromEmail: result[value].fromEmail,
                            fromDate: result[value].fromDate,
                            toDate: result[value].toDate,
                            workingDays: result[value].workingDays,
                            leaveWithoutApproval: result[value].leaveWithoutApproval
                        });
                    }
                }

                response.json({
                    success: true,
                    appliedLeaves: appliedLeaves
                })

            })
    }
});


// getting details from database.
exports.getDetails = ((request, response) => {

    let leaveId = request.params.leaveId
    LeaveApplication.find({
        _id: leaveId
    }, {}).then((result) => {

        response.json({
            success: true,
            leaveDetails: result[0]
        })
    })
});

exports.approveReject = ((request, response) => {
    let loggedInUser = request.userInfo;
    let leaveApplication = {
        status: request.body.approvedRejected,
        rejectionReason: request.body.reasonRejection,
        modifiedBy: request.body.modifiedBy,
        modifiedOn: request.body.modifiedOn,
        leaveWithoutApproval: request.body.leaveWithoutApproval

    }
    var mailOptions = {
        from: 1,
        to: request.body.toEmail,
        cc: config.emails,
        subject: 1,
        html: 1
    };
    LeaveApplication.findOneAndUpdate({
        _id: request.body.leaveId
    }, leaveApplication, {
            context: "query"
        }).then((result) => {
            let bodyHtml = config.approveRejectEmailContent;
            let subject = config.approveRejectSubject;
            bodyHtml = bodyHtml.replace("{leaveStatus}", leaveApplication.status);
            bodyHtml = bodyHtml.replace("{loggedInUser}", loggedInUser.userName);
            bodyHtml = bodyHtml.replace("{reasonOfRejection}", leaveApplication.rejectionReason);
            subject = subject.replace("{status}", leaveApplication.status).replace("{fromDate}", result.fromDate).replace("{toDate}", result.toDate);
            mailOptions.subject = subject;
            mailOptions.html = bodyHtml;
            let emailResponse = 1;
            if (config.prodMode == "ON") {
                emailResponse = sendEmail(mailOptions);
            } else {
                mailOptions.to = config.defaultEmail;
                emailResponse = sendEmail(mailOptions);
            }
            if (emailResponse.response) {
                logInfo(response, 'leaveController.approveReject - Error occured while sending email ' + mailOptions.to);
                response.json({
                    success: false,
                    err: "Something went wrong : Email Id is wrong for sending to."
                })
            } else {
                logInfo('leaveController.approveReject - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');

            }
            response.json({
                success: true,
                message: "Leave has been " + leaveApplication.status
            });
        })
});

exports.editLeave = ((request, response) => {

    let newLeaveApplication = {
        userId: request.userInfo.userId,
        userName: request.body.userName,
        fromEmail: request.body.fromEmail,
        fromDate: request.body.fromDate,
        toDate: request.body.toDate,
        workingDays: request.body.workingDays,
        reason: request.body.reason,
        leaveType: request.body.leaveType,
        modifiedBy: request.body.modifiedBy,
        modifiedOn: request.body.modifiedOn,
        isDeleted: request.body.isDeleted,
        status: "pending",
        rejectionReason: '',
        leaveWithoutApproval: request.body.leaveWithoutApproval
    }
    //console.log("newLeaveApplication", newLeaveApplication);

    LeaveApplication.findOneAndUpdate({
        _id: request.body.leaveId
    }, newLeaveApplication, {
            context: "query"
        }).then((result) => {

            logInfo(result, "Applied for leave");

            let loggedInUserId = request.userInfo.userId;
            let reportingManagerId = 1;
            let toEmail = 1;
            let bodyHtml = config.leaveEmailContent;
            let subject = config.leaveSubject;
            bodyHtml = bodyHtml.replace("{fromDate}", request.body.fromDate);
            bodyHtml = bodyHtml.replace("{toDate}", request.body.toDate);
            bodyHtml = bodyHtml.replace("{workingDays}", request.body.workingDays);
            bodyHtml = bodyHtml.replace("{leaveType}", request.body.leaveType);
            bodyHtml = bodyHtml.replace("{reason}", request.body.reason);
            bodyHtml = bodyHtml.replace("{leaveId}", result._id)
            //bodyHtml = bodyHtml.replace("{userName}", request.body.userName);
            //subject = subject.replace("{leaveType}", request.body.leaveType);
            subject = subject.replace("{fromDate}", request.body.fromDate)
                .replace("{toDate}", request.body.toDate)
                .replace("{userName}", request.body.userName);
            var mailOptions = {
                from: request.body.fromEmail,
                to: 1,
                subject: subject,
                html: bodyHtml
            };
            if (config.prodMode == "ON") {
                userModel.findOne({
                    "_id": loggedInUserId
                }, {
                        "reportingManagerId": 1
                    }).then((result) => {
                        reportingManagerId = result.reportingManagerId;
                        userModel.findOne({
                            "_id": reportingManagerId
                        }, {}).then((result) => {
                            toEmail = result.email;
                            mailOptions.to = toEmail;
                            mailOptions.cc = config.applytoEmail;
                            let response = sendEmail(mailOptions);
                            if (response.response) {
                                logInfo(response, 'leaveController.editLeave - Error occured while sending email ' + mailOptions.to);
                            } else {
                                logInfo('leaveController.editLeave - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');
                            }
                        })
                    });

            } else {
                toEmail = config.defaultEmail;
                mailOptions.to = toEmail;
                let response = sendEmail(mailOptions);
                if (response.response) {
                    logInfo(response, 'leaveController.editLeave - Error occured while sending email ' + mailOptions.to);
                    response.json({
                        success: false,
                        err: "Something went wrong : Email Id is wrong for sending to."
                    })
                } else {
                    logInfo('leaveController.editLeave - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');

                }
            }
            response.json({
                success: true,
                message: "Leave has been re-applied successfully"
            })

        });
})

exports.deleteLeave = ((request, response) => {
    //console.log("request", request.body.leaveId);
    LeaveApplication.findOneAndUpdate({ _id: request.body.leaveId }, { $set: { isDeleted: true, modifiedOn: new Date(), modifiedBy: request.userInfo.userId } }, { "new": true })
        .then((result) => {
            response.json({
                success: true,
                msg: `It has been deleted.`,
            });

        })
        .catch((err) => {
            response.json({ err });
        });
})

exports.approveLeave = ((request, response) => {
    //console.log("request", request.body.leaveId);
    LeaveApplication.findOneAndUpdate({ _id: request.body.leaveId }, { $set: { status: "Approved", modifiedOn: new Date(), modifiedBy: request.userInfo.userId } }, { "new": true })
        .then((result) => {
            response.json({
                success: true,
                msg: `It has been approved.`,
            });

        })
        .catch((err) => {
            response.json({ err });
        });
})

// get holiday list
exports.getHolidays = ((request, response) => {
    let month = new Date().getMonth() + 1;
    let year=new Date().getFullYear()

    let holidayList = [];
    Holiday.find({
        "year": year,
        "isActive": "1"
    })
        .then((results) => {
            if (results.length > 0) {
                for (let i = 0; i < results.length; i++) {
                    if (results[i].monthName !== '' && results[i].year !== '') {
                        holidayList.push({
                            date: results[i].date + "-" + results[i].monthName + "-" + results[i].year,
                            holiday: results[i].description
                        })
                    }
                }
            }

            response.json({
                success: true,
                holidayList: holidayList
            });
        });

});
exports.CheckForBalanceLeaves = ((request, response) => {
    //console.log('check balance', request.body)
    leaveValidation.init();
    let loggedInUserId = request.userInfo.userId;
    let newLeaveApplication = new LeaveApplication({
        fromDate: request.body.fromDate,
        toDate: request.body.toDate,
        workingDays: request.body.workingDays,
        reason: request.body.reason,
        leaveTypeId: request.body.leaveTypeId,
        leaveType: request.body.leaveType,
        leaveCategory: request.body.leaveCategory
    });
    let validationResult = 1;
    LeaveApplication.find({
        "leaveTypeId": newLeaveApplication.leaveTypeId,
        "userId": loggedInUserId,
        "status": "approved",
        "isDeleted": false
    }).then((result) => {
        let leavesTaken = 0;
       
        let todaysDate = new Date();
        //let todaysDateWithoutTime=(new Date(todaysDate.getFullYear(),todaysDate.getMonth(),todaysDate.getDate())).getTime();
        let currentMonth=todaysDate.getMonth();
        let currYear = todaysDate.getFullYear();
        let financialYearStartDate=new Date(),financialYearEndDate=new Date();
        //financial year April to March. Need to remove hardcoing
        if(currentMonth>2 && currentMonth<12)
        {
            financialYearStartDate=new Date(currYear,3,1);
            financialYearEndDate=new Date(currYear+1,2,31);
        }
        else
        {
            financialYearStartDate=new Date(currYear-1,3,1);
            financialYearEndDate=new Date(currYear,2,31);
        }
        let financialYearStartDateInTime=financialYearStartDate.getTime(),
        financialYearEndDateInTime=financialYearEndDate.getTime();
        for (let i = 0; i < result.length; i++) {
            //let date = dateUtil.DateToString(result[i].fromDate);
            //let date = new Date(result[i].fromDate);
            let fromDate=(new Date(result[i].fromDate)).getTime();
            //let toDate=(new Date(result[i].toDate)).getTime();
            
           
            if(fromDate>=financialYearStartDateInTime && fromDate<=financialYearEndDateInTime){
                leavesTaken += parseFloat(result[i].workingDays);
            }
            
        }
       
        let monthStart = config.monthStart;
      
        Leaves.find({
            leaveTypeId: newLeaveApplication.leaveTypeId,
            financialyear: currYear
        }, {
                maxinyear: 1,
                months: 1,
                financialyear:1
            }).then((result) => {
               
                let totalLeaves = result[0];
                if (newLeaveApplication.leaveTypeId === "2") {
                    validationResult = leaveValidation.checkForBalance(leavesTaken, newLeaveApplication.workingDays, newLeaveApplication.leaveTypeId, totalLeaves.maxinyear, totalLeaves.months, monthStart);
                } else {
                    validationResult = leaveValidation.checkForBalance(leavesTaken, newLeaveApplication.workingDays, newLeaveApplication.leaveTypeId, totalLeaves.maxinyear, "", monthStart);
                }
                response.json({
                    success: true,
                    leaveValidationResult: validationResult
                });
            });

    });

})
exports.getAllHolidays = ((request, response) => {
    let currentYear = 1;
    if (request.params !== null) {
        currentYear = request.params
    } else {
        currentYear = new Date().getFullYear();
    }
    Holiday.find({
        year: currentYear
    }, {
            monthName: 1,
            month: 1,
            date: 1,
            description: 1,
            year: 1
        }).then((result) => {
            response.json({
                success: true,
                list: result
            })
        })
})

exports.getAllLeavesForCalendar = ((request, response) => {
    LeaveApplication.find({
        isDeleted: false,
        "status": "approved",
    }, {
            "_id": 1,
            "leaveType": 1,
            "status": 1,
            "userName": 1,
            "fromDate": 1,
            "toDate": 1,
            "workingDays": 1
        }).then((result) => {
            let userReportsData = (result.length > 0) && result.map((d) => {

                let d1 = new Date(d.toDate);
                d1.setDate(d1.getDate() + 1);
                let endDate = dateUtil.DateToString(d1);
                let info = {
                    id: d._id,
                    start: d.fromDate,
                    end: endDate,
                    title: d.leaveType + ' - ' + d.userName,
                    leaveType: d.leaveType
                }
                return info;
            })
            response.json({
                success: true,
                result: userReportsData
            })
        })
})