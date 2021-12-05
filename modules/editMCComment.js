module.exports = {
    name: "EditMCComment",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            if (!req.session || !req.body || req.session.roleName !== "Marketing Coordinator") return reject({status: 403});
            try {
                await db.Run(`UPDATE Comment SET Content = ?, CEditedAt = ? WHERE CommentID = ?`,
                    [req.body.comment, Date.now(), req.body.comID]);
                let row = await db.Get(`SELECT ArticleID FROM Comment WHERE CommentID = ?`, [req.body.comID]);
                if (!row) return reject({status: 404});
                console.log(req.body);
                await db.Run(`UPDATE Article SET Status = ? WHERE ArticleID = ?`,[req.body.evaluate, row.ArticleID]);
                return resolve({status: 200, redirect: `/Article/${row.ArticleID}`});
            } catch (err) {
                console.log(err)
                return reject({status: 500});
            }
        })
    }
}