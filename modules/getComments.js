module.exports = {
    name: "Get_Comments",
    execute(req, res, db) {
        return new Promise(async (resolve, reject) => {
            if (!req.session.userID) return reject({status: 403});
            try {
                let rows = await db.All(`SELECT * FROM UserComment, Account WHERE UserComment.ArticleID = ? AND Account.AccID = UserComment.AccID`, [req.query.page]);
                for (let row of rows ) delete row.Password;
                return resolve({ status: 200, data: rows })
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}