module.exports = {
    name: "Topic",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            if (!req.session.userID) return reject({status:403});
            try {
                let topic = await db.Get(`SELECT * FROM Topic WHERE TopicID = ?`, [req.params.id]);
                if (req.session.roleID && req.session.roleName === "Student") {
                    let article = await db.Get(`SELECT * FROM Article WHERE TopicID = ? AND AuthorID = ?`, [req.params.id, req.session.userID]);
                    let topic = await db.Get(`SELECT * FROM Topic WHERE TopicID = ?`, [req.params.id]);
                    if (req.session.faculty.FacultyID == topic.FacultyID) {
                        if (!article) {
                            if (Date.now() < +topic.ClosedOn) return resolve({status: 200, redirect: `/${req.params.id}/Upload`});
                            else return resolve({status: 200, respText: "You cannot submit your assignment because it has expired."});
                        } else {
                            return resolve({status: 200, redirect: `/Article/${article.ArticleID}`});
                        }
                    } else return resolve({status: 200, respText: "This is not your field of study."});
                } else {
                    let query = `SELECT * FROM Article, Account WHERE Article.TopicID = ? AND Article.AuthorID = Account.AccID
                        ${req.session.roleName === "Admin" ? "" : " AND Article.Status = 'Approved'"}`;
                    let articles = await db.All(query, [req.params.id]);
                    return resolve({ status: 200, render: "pages/topic", data: { Title: topic.TopicName, facultyID: req.params.id, closedOn: topic.ClosedOn, articles: articles } });
                }
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}