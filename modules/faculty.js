module.exports = {
    name: "Faculty",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            try {
                let topics = await db.All(`SELECT * FROM Topic, Faculty WHERE Faculty.FacultyID = ? AND Topic.FacultyID = Faculty.FacultyID`, [req.params.id]);
                return resolve({ status: 200, render: "pages/faculty", data: { Title: this.name, topics: topics } })
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}