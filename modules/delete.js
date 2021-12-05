const fs = require('fs')

module.exports = {
    name: "Delete",
    execute(req, res, db) {
        return new Promise(async (resolve, reject) => {
            if (!req.session||!req.body||!req.body.type) return reject({status:403});
            try {
                switch (req.body.type) {
                    case "Article":
                        await db.Run(`DELETE FROM Article WHERE ArticleID = ?`, [req.body.page]);
                        break;
                    case "Comment":
                        await db.Run(`DELETE FROM UserComment WHERE CmtID = ?`, [req.body.cmtID]);
                        break;
                    case "Account":
                        if (req.session.roleName !== "Admin") return reject({status: 403});
                        await db.Run(`DELETE FROM Account WHERE AccID = ?`, [req.body.accID]);
                        break;
                    case "Topic":
                        if (req.session.roleName !== "Admin") return reject({status: 403});
                        await db.Run(`DELETE FROM Topic WHERE TopicID = ?`, [req.body.topicID]);
                        break;
                    case "Faculty":
                        if (req.session.roleName !== "Admin") return reject({status: 403});
                        await db.Run(`DELETE FROM Faculty WHERE FacultyID = ?`, [req.body.facultyID]);
                        break;
                    case "Attachment":
                        let row = await db.Get(`SELECT Url FROM Attachment WHERE AttID = ?`, [req.body.attID]);
                        await db.Run(`DELETE FROM Attachment WHERE AttID = ?`, [req.body.attID]);
                        fs.unlinkSync(`./public/${row.Url}`);
                        break;
                    default:
                        return reject({status: 404});
                }
                return resolve({ status: 200 });
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}