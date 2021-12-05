module.exports = {
    name: "Get_Attachments",
    execute(req, res, db) {
        return new Promise(async (resolve, reject) => {
            if (!req.session.userID) return reject({status: 403});
            try {
                let rows = await db.All(`SELECT * FROM Attachment WHERE ArticleID = ? `, [req.query.page]);
                return resolve({ status: 200, data: rows })
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}