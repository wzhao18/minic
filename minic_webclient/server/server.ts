import express from 'express';
import session from 'express-session';
import path from 'path';
import bodyParser from 'body-parser';
var morgan = require('morgan')

const CLIENT_DIR = "../client/build";

const app = express();
app.use(morgan('combined'))
app.use(bodyParser.json())

app.use(
    function(req, res, next) {
        var allowedOrigins = ['http://localhost:3000'];
        var origin = req.headers.origin;
        if(allowedOrigins.indexOf(origin) > -1){
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, PATCH');
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Expose-Headers", "*");
        next();
    }
);

app.use(session({
    secret: 'oursecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60000 * 60 * 72,
        httpOnly: true
    }
}));

app.use(express.static(path.join(__dirname, CLIENT_DIR)));

const routes = ["/login", "/signup"]
for (let i = 0; i < routes.length; i++) {
    let route = routes[i];
    app.get(route, (req, res) => {
        if (req.session.user) {
            res.redirect("/");
        } else {
            res.sendFile(path.resolve(__dirname, CLIENT_DIR, 'index.html'))
        }
    });
}

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, CLIENT_DIR, 'index.html'))
});

app.use("/service", require("./services"));
app.use("/sample", require("./sample"));
app.use("/auth", require("./auth"));
app.use("/code", require("./code"));

const port = process.env.PORT || 23451;
app.listen(port, "0.0.0.0", () => {
	console.log(`Listening on port ${port}...`)
});