module.exports = {
    name: "Coordinator",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            if (!req.session || req.session.roleName !== "Marketing Coordinator") return reject({status: 403});
            try {
                if (req.params.page == "All_Articles") {
                    let rows = await db.All(`SELECT * FROM Article, Topic, Account, Faculty WHERE Faculty.FacultyLeader = ? AND Article.TopicID = Topic.TopicID AND Topic.FacultyID = Faculty.FacultyID AND Article.AuthorID = Account.AccID`,
                        [req.session.userID]);
                    let result = rows.map(entry => { delete entry.Password; return entry; });
                    return resolve({status: 200, render: "pages/managerArticle", data: {Title: "All Articles", Articles: result}});
                } else if (req.params.page == "Unapproved_Articles") {
                    let rows = await db.All(`SELECT * FROM Article, Topic, Account, Faculty WHERE Faculty.FacultyLeader = ? AND Article.TopicID = Topic.TopicID AND Topic.FacultyID = Faculty.FacultyID AND Article.Status = ? AND Article.AuthorID = Account.AccID`,
                        [req.session.userID, "Unapproved"]);
                    let result = rows.map(entry => { delete entry.Password; return entry; });
                    return resolve({status: 200, render: "pages/managerArticle", data: {Title: "Unapproved Articles", Articles: result}});
                } else if (req.params.page == "Students") {
                    let rows = await db.All(`SELECT AccID, Username, Email, Name, StudentID, CreatedAt FROM Account WHERE StudentFacultyID = ? AND RoleID = ?`, [req.session.faculty.FacultyID, 2]);
                    return resolve({status: 200, render: "pages/students", data: {Title: "Students", Students: rows}});
                } else if (req.params.page == "Comment") {
                    let row = await db.Get(`SELECT * FROM Article WHERE ArticleID = ?`, [req.query.article]);
                    return resolve({status: 200, render: "pages/mcComment", data: row});
                } else if (req.params.page == "EditComment") {
                    let row = await db.Get(`SELECT * FROM Comment WHERE CommentID = ?`, [req.query.id]);
                    return resolve({status: 200, render: "pages/editMCComment", data: {Title: "Edit Comment", Comment: row}});
                }
                else {
                    return reject({status: 404});
                }
            } catch (err) {
                console.log(err)
                return reject({status: 500});
            }
        })
    }
}