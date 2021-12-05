module.exports = {
    name: "Logout",
    execute(req, res, db, bcrypt) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!req.session) return reject({status: 403});
                req.session.destroy();
                return resolve({ status: 200, redirect: "/" })
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}