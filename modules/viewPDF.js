module.exports = {
    name: "View",
    execute(req, res, db) {
        return new Promise(async (resolve, reject) => {
            if (!req.session) return reject({status: 403});
            try {
                let file = await db.Get(`SELECT * FROM Attachment WHERE AttID = ?`, [req.params.id]);
                return resolve({ status: 200, render: "pages/viewPDF", data: {Tilte: file.FileName, File: file} });
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}