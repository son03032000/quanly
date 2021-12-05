module.exports = {
    name: "Contact",
    execute(req, res, db) {
        return new Promise(async (resolve, reject) => {
            try {
                let faculty = await db.Get(`SELECT StudentFacultyID FROM Account WHERE AccID = ?`, [req.session.userID]);
                let leader = await db.Get(`SELECT * FROM Account, Faculty WHERE Faculty.FacultyID = ? AND Account.AccID = Faculty.FacultyLeader`, [faculty.StudentFacultyID]);
                delete leader.Password;
                return resolve({ status: 200, render: "pages/contact", data: {Title: "Contact", Account: leader} })
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}