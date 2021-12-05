module.exports = {
    name: "Register",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await db.Get(`SELECT * FROM Account WHERE Username = ?`, [req.body.username])) return resolve({ status: 202, respText: "Account already exists." });
                let pwEncrypted = await bcrypt.hash(req.body.password, 10);
                await db.Run(`INSERT OR IGNORE INTO Account 
                    (Username, Password, Email, Name, CreatedAt) VALUES (?, ?, ?, ? , ?)`,
                    [req.body.username, pwEncrypted, req.body.email, req.body.name, (new Date()).getTime().toString()]);
                return resolve({
                    status: 200,
                    redirect: "/",
                    respText: "<p>Signup successfully!</p>"
                })
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}