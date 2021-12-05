module.exports = {
    name: "Article",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            try {
                let article = await db.Get(`SELECT * FROM Article, Account, Topic, Faculty WHERE Article.ArticleID = ? AND Article.AuthorID = Account.AccID AND Article.TopicID = Topic.TopicID AND Topic.FacultyID = Faculty.FacultyID`,
                    [req.params.id]);
                article.Attachments = await db.All(`SELECT * FROM Attachment WHERE AuthorID = ? AND ArticleID = ?`, [article.AccID, req.params.id]);
                article.MCComment = await db.Get(`SELECT * FROM Comment, Account WHERE Comment.ArticleID = ? AND Comment.AuthorID = Account.AccID`, [req.params.id]);
                return resolve({ status: 200, render: "pages/article", data: article })
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}