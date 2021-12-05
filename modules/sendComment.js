module.exports = {
    name: "Send_Comment",
    execute(req, res, db) {
        return new Promise(async (resolve, reject) => {
            if (!req.body) return reject({status:403});
            db.Run(`INSERT INTO UserComment (AccID, Content, CreatedAt, ArticleID) VALUES (?, ?, ?, ?)`,
                [req.body.author, req.body.message.replace(/\n/g, "<br>"), (new Date()).getTime().toString(), req.body.page]).then(() => {
                return resolve({ status: 200});
            }).catch(err => {
                return reject({status: 500});
            })
        })
    }
}