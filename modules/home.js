module.exports = {
    name: "Home",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            try {
                let faculty = await db.All(`SELECT * FROM Faculty, Account WHERE Faculty.FacultyLeader = Account.AccID`);
                return resolve({ status: 200, render: "pages/home", data: { Title: this.name, faculty: faculty } })
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}