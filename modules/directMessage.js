module.exports = {
    name: "DirectMessage",
    execute(req, res, db)  {
        return new Promise(async (resolve, reject) => {
            if (!req.session || req.session.userID == req.params.id) return reject({status: 404});
            try {
                let message = await db.All(`SELECT * FROM DirectMessage, Account WHERE ((DirectMessage.FromUserID = ? AND DirectMessage.ToUserID = ?) OR (DirectMessage.FromUserID = ? AND DirectMessage.ToUserID = ?)) AND DirectMessage.FromUserID = Account.AccID`,
                    [req.session.userID, req.params.id, req.params.id, req.session.userID]);
                message = message.map(entry => { delete entry.Password; return entry; });
                return resolve({ status: 200, render: "pages/directMessage", data: {Title: "Direct Message", Message: message }});
            } catch (err) {
                console.log(err)
                return reject({status: 500});
            }
        })
    }
}