const faculty = require("./faculty");

module.exports = {
    name: "DoRegister",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            if (!req.session.roleName || req.session.roleName !== "Admin") return reject({status: 403});
            try {
                if (await db.Get(`SELECT * FROM Account WHERE Username = ?`, [req.body.username])) return resolve({ status: 202, respText: "Account already exists." });
                let pwEncrypted = await bcrypt.hash(req.body.password, 10);
                switch (req.body.role) {
                    case "2":
                        await db.Run(`INSERT OR IGNORE INTO Account (Username, Password, Email, Name, RoleID, CreatedAt, StudentID, StudentFacultyID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [req.body.username, pwEncrypted, req.body.email, req.body.name, req.body.role, (new Date()).getTime().toString(), req.body.studentID, req.body.faculty]);
                        break;
                    case "3":
                        let statement = await db.Run(`INSERT OR IGNORE INTO Account (Username, Password, Email, Name, RoleID, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
                            [req.body.username, pwEncrypted, req.body.email, req.body.name, req.body.role, (new Date()).getTime().toString()]);
                        await db.Run(`UPDATE Faculty SET FacultyLeader = ? WHERE FacultyID = ?`, [statement.lastID, req.body.faculty]);
                        break;
                    default:
                        await db.Run(`INSERT OR IGNORE INTO Account (Username, Password, Email, Name, RoleID, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
                            [req.body.username, pwEncrypted, req.body.email, req.body.name, req.body.role, (new Date()).getTime().toString()]);
                        break;
                }
                return resolve({ status: 200, redirect: "/Admin/Account" });
            } catch (err) {
                console.log(err);
                return reject({status: 500});
            }
        })
    }
}