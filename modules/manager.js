module.exports = {
    name: "Manager",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            if (!req.session || req.session.roleName !== "Marketing Manager") return reject({status: 403});
            try {
                if (req.params.page == "DownloadArticles") {
                    let rows = await db.All(`SELECT * FROM Article, Topic, Faculty, Account WHERE Article.Status = ? AND Article.TopicID = Topic.TopicID AND Topic.FacultyID = Faculty.FacultyID AND Account.AccID = Article.AuthorID`,
                        ["Approved"]);
                    rows = rows.map(entry => { delete entry.Password; return entry; });
                    return resolve({status: 200, render: "pages/downloadArticles", data: {Title: "Download Articles", Articles: rows}});
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