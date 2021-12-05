module.exports = {
    name: "Editor",
    execute(req, res, db) {
        return new Promise(async (resolve, reject) => {
            if (!req.session.userID) return reject({status: 403});
            try {
                let article = await db.Get(`SELECT * FROM Article WHERE ArticleID = ?`, [req.query.id]);
                return resolve({ status: 200, render: "pages/editor", data: article })
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}