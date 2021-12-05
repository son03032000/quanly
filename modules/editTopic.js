module.exports = {
    name: "EditTopic",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            if (!req.session || !req.body || req.session.roleName !== "Admin") return reject({status: 403});
            try {
                await db.Run(`UPDATE Topic SET TopicName = ?, ClosedOn = ?, FacultyID = ? WHERE TopicID = ?`,
                    [req.body.title, (new Date(req.body.deadline)).getTime(), req.body.faculty, req.body.topicID]);
                return resolve({status: 200, redirect: `/Admin/Topic`})
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}