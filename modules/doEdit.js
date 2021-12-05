module.exports = {
    name: "DoEdit",
    execute(req, res, db, bcrypt, nodemailer) {
        return new Promise(async (resolve, reject) => {
            if (!req.session.userID || !req.body ) return reject({status: 403});
            if (req.fileValidationError) return reject({status: 200, respText: `<script>alert("${req.fileValidationError}"); history.back();</script>`});
            try {
                await db.Run(`UPDATE Article SET Title = ?, Message = ?, EditedAt = ? WHERE ArticleID = ?`, [req.body.title, req.body.message, Date.now(), req.body.article]);
                if (req.files.length > 0) {
                    for (let file of req.files) {
                        await db.Run(`INSERT INTO Attachment (AuthorID, ArticleID, Url, FileName) VALUES (?, ?, ?, ?)`,
                            [req.session.userID, req.body.article, `${file.destination.replace("./public", "")}/${file.filename}`, file.filename]);
                    }
                }
                return resolve({status: 200, redirect: `/Article/${req.body.article}`})
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}