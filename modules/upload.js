module.exports = {
    name: "Upload",
    execute(req, res, db, bcrypt, nodemailer) {
        return new Promise(async (resolve, reject) => {
            if (!req.session.userID || !req.body || req.files.length < 1) return reject({status: 403});
            if (req.fileValidationError) return reject({status: 200, respText: `<script>alert("${req.fileValidationError}"); history.back();</script>`});
            try {
                let statement = await db.Run(`INSERT INTO Article (AuthorID, TopicID, Title, Message, CreatedAt, Status) VALUES (?, ?, ?, ?, ?, 'Unapproved')`,
                    [req.session.userID, req.body.topic, req.body.title, req.body.message, Date.now()]);
                for (let file of req.files) {
                    await db.Run(`INSERT INTO Attachment (AuthorID, ArticleID, Url, FileName) VALUES (?, ?, ?, ?)`,
                        [req.session.userID, statement.lastID, `${file.destination.replace("./public", "")}/${file.filename}`, file.filename]);
                }
                // --> Cần mail thực để chạy
                // try {
                //     let row = await db.Get(`SELECT * FROM Account, Faculty, FacultyTopic WHERE FacultyTopic.TopicID = ? AND FacultyTopic.FacultyID = Faculty.FacultyID AND Account.AccID = Faculty.FacultyLeader`,
                //         req.body.topic);
                //     let transporter =  nodemailer.createTransport({
                //         service: 'Gmail',
                //         auth: {
                //             user: 'hieulagch18106@gmail.com',
                //             pass: '123456'
                //         }
                //     });
                //     var mainOptions = {
                //         from: "Project's Admin",
                //         to: row.Email,
                //         subject: 'There is a new post on the topic you manage.',
                //         text: "There is a new post on the topic you manage. Please comment within 14 days.",
                //         html: `<br><a href="localhost:3000/Article/${statement.lastID}">Link</a>`
                //     }
                // } catch (error_mail) { console.log(error_mail) }
                return resolve({status: 200, redirect: `/Article/${statement.lastID}`})
            } catch (err) {
                return reject({status: 500});
            }
        })
    }
}