module.exports = {
    name: "Admin",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            if (!req.session || req.session.roleName !== "Admin") return reject({status: 403});
            try {
                if (req.params.page == "Account") {
                    let rows = await db.All(`SELECT * FROM Account, Role WHERE Account.RoleID = Role.RoleID`);
                    let faculty = await db.All(`SELECT * FROM Faculty`);
                    let result = rows.filter(entry => entry.Username !== "Admin").map(entry => {
                        delete entry.Password;
                        if (!entry.StudentFacultyID) {
                            for (let f of faculty) {
                                if (f.FacultyLeader == entry.AccID) {
                                    entry.FacultyName = f.FacultyName;
                                    break;
                                }
                            }
                        } else {
                            for (let f of faculty) {
                                if (f.FacultyID == entry.StudentFacultyID) {
                                    entry.FacultyName = f.FacultyName;
                                    break;
                                }
                            }
                        }
                        return entry;
                    });
                    return resolve({status: 200, render: "pages/accountManagement", data: { Title: "Account Management", Account: result }});
                } else if (req.params.page == "EditAccount") {
                    let account = await db.Get(`SELECT * FROM Account, Role WHERE Account.AccID = ? AND Account.RoleID = Role.RoleID`, [req.query.id]);
                    let faculty = await db.All(`SELECT * FROM Faculty`);
                    if (account) return resolve({status: 200, render: "pages/editAccount", data: {Title: "Edit Account", Account: account, Faculty: faculty}});
                    else return reject({status: 404});
                } else if (req.params.page == "Register") {
                    let rows = await db.All(`SELECT * FROM Faculty`);
                    return resolve({status: 200, render: "pages/register", data: { Title: "Register", Faculty: rows}});
                } else if (req.params.page == "Topic") {
                    let rows = await db.All(`SELECT * FROM Topic, Faculty WHERE Topic.FacultyID = Faculty.FacultyID`);
                    return resolve({status: 200, render: "pages/topicManagement", data: { Title: "Topic Management", Topic: rows }});
                } else if (req.params.page == "CreateTopic") {
                    let rows = await db.All(`SELECT * FROM Faculty`);
                    return resolve({status: 200, render: "pages/createTopic", data: { Title: "Create Topic", Faculty: rows}});
                } else if (req.params.page == "EditTopic") {
                    let row = await db.Get(`SELECT * FROM Topic WHERE TopicID = ?`, [req.query.id]);
                    let faculty = await db.All(`SELECT * FROM Faculty`);
                    return resolve({status: 200, render: "pages/editTopic", data: { Title: "Edit Topic", Faculty: faculty, Topic: row}});
                }
                else {
                    return reject({status: 404});
                }
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}