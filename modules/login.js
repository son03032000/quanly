module.exports = {
    name: "Login",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            try {
                let row = await db.Get(`SELECT * FROM Account, Role WHERE Account.Username = ? AND Account.RoleID = Role.RoleID`, [req.body.username]);
                if (!row) return resolve({status: 202, respText: "Account does not exist."});
                let resp = await bcrypt.compare(req.body.password, row.Password);
                if (!resp) return resolve({status: 202, respText: "Incorrect password."});
                req.session.userID = row.AccID;
				req.session.username = row.Username;
                req.session.roleID = row.RoleID;
                req.session.roleName = row.RoleName;
                if (row.RoleName == "Marketing Coordinator") {
                    req.session.faculty = await db.Get(`SELECT * FROM Faculty WHERE FacultyLeader = ?`, [row.AccID]);
                }
                if (row.RoleName == "Student") {
                    req.session.faculty = await db.Get(`SELECT * FROM Faculty WHERE FacultyID = ?`, [row.StudentFacultyID]);
                }
                //req.session.facultyID = row.FacultyID;
                if (req.body.remember) req.session.cookie.maxAge = 30*24*60*60*1000;
                resolve({
                    status: 200,
                    redirect: "/home"
                })
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}