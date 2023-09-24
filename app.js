const express = require("express");
const mysql = require("mysql");
const dotenv =require("dotenv");
const path = require("path");
const exp = require("constants");
const cookieParser = require('cookie-parser');



dotenv.config({path:'./.env'});

const app = express();
app.use(cookieParser());


const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const publicDir = path.join(__dirname,'./public');
//console.log(__dirname);
app.use(express.static(publicDir));

//parse URL-encode bodies (as sent by html forms)
app.use(express.urlencoded({extended: false}));
// parse JSON bodies (as sent by html)
app.use(express.json());
app.set('view engine','hbs');

db.connect((error)=>{
    if (error) {
        console.log(error);
    }else{
        console.log("mysql conneted...");
    }
});

// define routes ... url
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));


app.listen(5001,()=>{
    console.log("server started on port 5001");
});
