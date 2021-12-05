module.exports = {
    name: "MCComment",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            if (!req.session || !req.body || req.session.roleName !== "Marketing Coordinator") return reject({status: 403});
            try {
                await db.Run(`INSERT INTO Comment (AuthorID, ArticleID, Content, CCreatedAt) VALUES (?, ?, ?, ?)`,
                    [req.session.userID, req.body.articleID, req.body.comment, Date.now()]);
                await db.Run(`UPDATE  Article SET Status = ? WHERE ArticleID = ?`,[req.body.evaluate, req.body.articleID]);
                return resolve({status: 200, redirect: `/Article/${req.body.articleID}`});
            } catch (err) {
                console.log(err)
                return reject({status: 500});
            }
        })
    }
}