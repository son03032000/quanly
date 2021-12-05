const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
let nodemailer =  require('nodemailer')
const app = express()
const port = "3000"
const bcrypt = require('bcrypt')
const fs = require('fs')
const AdmZip = require('adm-zip')

function checkFile (req, file, cb) {
    if(!file.originalname.match(/\.(jpg|png|gif|jpeg|pdf)$/)) {
        req.fileValidationError = "Must upload image or pdf files.";
        return cb(null, false, req.fileValidationError);
    } else cb(null, true)
}

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
         cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, `${removeAccents(file.originalname.substr(0,file.originalname.lastIndexOf('.'))).replace(/\s/g,'')}-${Date.now()}.${file.originalname.substr(file.originalname.lastIndexOf('.')+1,file.originalname.length)}`);
    }
})
   
let upload = multer({ storage: storage, limits: { fileSize: 5*1024*1024 }, fileFilter: checkFile })

const sqlite3Promises = require('./function/sqlite3Promise')
const db = new sqlite3Promises("Database.db")

let modules = new Map();
const files = fs.readdirSync('./modules').filter(file => file.endsWith('.js'));
for (const file of files) {
	const module = require(`./modules/${file}`);
	modules.set(module.name, module);
}

const moduleExecute = (method, req, res) => {
    const module = modules.get(method);
    if (!module) return res.status(404).send("PAGE NOT FOUND!");
    module.execute(req, res, db, bcrypt, nodemailer).then(result => {
        result.render ? res.render(result.render, { session: req.session, data: result.data }) :
            result.redirect ? res.redirect(result.redirect) :
            res.status(result.status).send(JSON.stringify(result.data)||result.respText);
    }).catch(err => {
        res.status(err.status||500);
        err.respText ? res.send(err.respText) : res.sendStatus(err.status||500);
    });
}  

const returnLogin = (res) => {
    res.redirect("/Login");
}

app.use(express.static('public'))
const session = require('express-session')({
    secret: "sunbros",
	resave: true,
  	saveUninitialized: true,
	cookie: {},
})
app.use(session);
app.use(bodyParser.json())     
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.set('views', './views')

app.get('/GET/:get', (req, res) => {
    moduleExecute(req.params.get, req, res);
})

app.post('/POST/:post', (req, res) => {
    moduleExecute(req.params.post, req, res);
})

app.get('/', (req, res) => {
    res.render('pages/index');
})

app.get('/home', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    moduleExecute("Home", req, res);
})

app.get('/Contact', (req, res) => {
    if (!req.session.userID || req.session.roleName != "Student") return returnLogin(res);
    moduleExecute("Contact", req, res);
})

app.get('/Terms', (req, res) => {
    if (!req.session.userID || req.session.roleName != "Student") return returnLogin(res);
    res.render("pages/terms", {
        session: req.session,
        data: {Title: "Terms"}
    })
})

app.get('/:topic/Upload', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    res.render(`pages/upload`, {session: req.session, data: {Title: "Upload", TopicID: req.params.topic}});
})

app.get('/Editor', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    moduleExecute("Editor", req, res);
})

app.get('/Login', (req, res) => {
    res.render(`pages/login`, {data: {Title: "Login"}});
})

app.get('/Logout', (req, res) => {
    moduleExecute("Logout", req, res);
})

app.get('/Faculty/:id', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    moduleExecute("Faculty", req, res);
})

app.get('/Topic/:id', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    moduleExecute("Topic", req, res);
})

app.get('/Article/:id', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    moduleExecute("Article", req, res);
})

app.get('/View/:id', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    moduleExecute("View", req, res);
})

app.get('/Admin', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    if (req.session.roleName !== "Admin") return res.status(403).sendStatus(403);
    res.render(`pages/admin`, {session: req.session, data: {Title: "Admin"}});
})

app.get('/Admin/:page', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    if (req.session.roleName !== "Admin") return res.status(403).sendStatus(403);
    moduleExecute("Admin", req, res);
})

app.get('/Coordinator', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    if (req.session.roleName !== "Marketing Coordinator") return res.status(403).sendStatus(403);
    res.render(`pages/coordinator`, {session: req.session, data: {Title: "Coordinator"}});
})

app.get('/Coordinator/:page', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    if (req.session.roleName !== "Marketing Coordinator") return res.status(403).sendStatus(403);
    moduleExecute("Coordinator", req, res);
})

app.get('/Manager', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    if (req.session.roleName !== "Marketing Manager") return res.status(403).sendStatus(403);
    res.render(`pages/manager`, {session: req.session, data: {Title: "Manager"}});
})

app.get('/Manager/:page', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    if (req.session.roleName !== "Marketing Manager") return res.status(403).sendStatus(403);
    moduleExecute("Manager", req, res);
})

app.post('/Upload', upload.array('files', 4), (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    moduleExecute("Upload", req, res);
})

app.post('/DoEdit', upload.array('files', 4), (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    moduleExecute("DoEdit", req, res);
})

app.get('/Message/:id', (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    moduleExecute("DirectMessage", req, res);
})

const createZip = (files, out) => {
	const zip = new AdmZip();
  	for (let file of files) {
        zip.addLocalFile(file);
    }
  	zip.writeZip(out);
}

app.get('/Download/:id', async (req, res) => {
    if (!req.session.userID) return returnLogin(res);
    if (req.session.roleName !== "Marketing Manager") return res.status(403).sendStatus(403);
    try {
        let article = await db.Get(`SELECT * FROM Article, Topic WHERE Article.ArticleID = ? AND Topic.TopicID = Article.TopicID`, [req.params.id]);
        if (article.Status == "Approved") {
            let attachments = await db.All(`SELECT * FROM Attachment WHERE ArticleID = ?`, [req.params.id]);
            if (attachments.length > 0) {
                let files = attachments.map(entry => { return `./public${entry.Url}`; });
                let fileName = removeAccents(`${article.TopicName}-${article.ArticleID}-${Date.now()}.zip`);
                let zip = `./zip/${fileName}`;
                createZip(files, zip);
                res.download(zip, fileName, (error) => {
                    if (error) console.log(error);
                    fs.unlinkSync(zip);
                })
            }
        }
    } catch (err) { console.log(err); return res.status(500).sendStatus(500); };
})

let server = app.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
})
const io = require("socket.io")(server)

let sharedsession = require("express-socket.io-session")
io.use(sharedsession(session));

io.on("connection", (socket) => {
    socket.on("SendMessage", async (msg) => {
        try {
            let toUserID = socket.handshake.headers.referer.split("/").pop(); //mục đích bảo mật, lấy id ng nhận từ url
            await db.Run(`INSERT INTO DirectMessage (FromUserID, ToUserID, Message, CreatedAt) VALUES (?, ?, ?, ?)`, [socket.handshake.session.userID, toUserID, msg, Date.now()]);
            let user = await db.Get(`SELECT * FROM Account WHERE AccID = ?`, [socket.handshake.session.userID]);
            socket.emit("Message", msg, user.Username); //gửi cho người gửi dòng chat
            let toUserScID = null; //id của session (tự mình đặt)
            for (const [k, v] of io.sockets.sockets.entries()) {
                if (v.handshake.session.userID == toUserID) {
                    toUserScID = v.id; //id của socket-io
                    break;
                }
            }
            if (toUserScID) io.to(`${toUserScID}`).emit("Message", msg, user.Username); //gửi cho người nhận
        } catch (err) { console.log(err) }
        
        // const module = modules.get("SendMessage");
        // module.execute(socket, msg);
    });
});