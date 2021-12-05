module.exports = {
    name: "CreateTopic",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            if (!req.session || !req.body || req.session.roleName !== "Admin") return reject({status: 403});
            try {
                await db.Run(`INSERT INTO Topic (TopicName, CreatedAt, ClosedOn, FacultyID) VALUES (?, ?, ?, ?)`,
                    [req.body.title, Date.now(), (new Date(req.body.deadline)).getTime(), req.body.faculty]);
                return resolve({status: 200, redirect: `/Admin/Topic`})
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}