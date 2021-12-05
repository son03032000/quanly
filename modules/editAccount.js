module.exports = {
    name: "EditAccount",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            if (!req.session.roleName || req.session.roleName !== "Admin") return reject({status: 403});
            try {
                let row = await db.Run(`SELECT * FROM Account WHERE AccID = ?`, [req.body.accID]);
                if (!row) return reject({status: 404});
                let pwEncrypted;
                if (req.body.password && req.body.password.length > 0) pwEncrypted = await bcrypt.hash(req.body.password, 10);
                await db.Run(`UPDATE Account SET ${pwEncrypted ? `Password = '${pwEncrypted}, '` : ""} Email = ?, Name = ?, RoleID = ?
                    ${req.body.role == "2" ? `, StudentID = '${req.body.studentID}', StudentFacultyID = '${req.body.faculty}'` : ""} WHERE AccID = ?`,
                    [req.body.email, req.body.name, req.body.role, req.body.accID]);
                if (row.RoleID == "3" && req.body.role != "3") await db.Run(`UPDATE Faculty SET FacultyLeader = null WHERE FacultyLeader = ?`, [row.AccID]);
                if (req.body.role == "3") await db.Run(`UPDATE Faculty SET FacultyLeader = ? WHERE FacultyID = ?`, [req.body.accID, req.body.faculty]);
                return resolve({ status: 200, redirect: "/Admin/Account" });
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}