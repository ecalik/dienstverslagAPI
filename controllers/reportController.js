const Report = require("../models/reportModel");
const User = require("../models/userModel");
const io = require("../socket");

exports.getReports = (req, res, next) => {
  Report.find()
    .then((reports) => {
      //console.log(JSON.stringify(reports));
      res.status(200).json(reports);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.archiveReport = (req, res, next) => {
  const reportId = req.params.reportId;
  const userId = req.body.userId;
  //console.log(userId + "   " + reportId);
  User.findOne({ _id: userId }).then((user) => {
    if (user.role !== "admin") {
      //console.log(user.role);
      const error = new Error("Verification error");
      error.statusCode = 401;
      throw error;
    }
    Report.findOneAndUpdate({ _id: reportId }, { archived: true })
      .then((report) => {
        io.getIO().emit("report", { action: "archiveOc" });
        //console.log(JSON.stringify(report));
        res.status(200).json(report);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.postReport = (req, res, next) => {
  const d = new Date();
  let date = d.toLocaleDateString();
  const subject = req.body.subject;
  const machine = req.body.machine;
  const oCPunt = req.body.oCPunt;
  const reportText = req.body.reportText;
  const shift = req.body.shift;
  const creator = req.body.creator;
  const report = new Report({
    subject: subject,
    machine: machine,
    oCPunt: oCPunt,
    reportText: reportText,
    archived: false,
    shift: shift,
    creator: creator,
    date: date,
  });
  report
    .save()
    .then((result) => {
      io.getIO().emit("report", { action: "postReport" });
      //console.log(result);
      res.status(201).json({
        message: "Post created succesfully",
        report: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteReport = (req, res, next) => {
  const rid = req.params.reportId;
  Report.findOne({ _id: rid }).then((report) => {
    if (!report) {
      const error = new Error("This rid does not exist");
      throw error;
    }
    report
      .deleteOne({ _id: rid })
      .then((result) => {
        io.getIO().emit("report", { action: "deleteReport" });
        res.status(202).json({
          message: "Delete success",
          report: result,
        });
      })
      .catch((err) => console.log(err));
  });
};
