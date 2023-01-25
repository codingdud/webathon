const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
}); 

exports.register = (req, res)=>{
    console.log(req.body);
    
    /* const name = req.body.name;
    const mail = req.body.mail;
    const pass = req.body.pass;
    const passcon = req.body.passcon; */

    const { user, mail, pass, passcon} = req.body;
    //console.log(mail);
    db.query('SELECT email FROM temp WHERE email = ?',[mail], async (error, results) => {
        if(error){
            console.log(error);
        }
        if(results.length > 0){
            return res.render('register',{
                message: 'this email is already in use'
            })
        } else if (pass !== passcon) {
            return res.render('register',{
                message: 'password is not same!'
            });
        }
        let hashedPasswd = await bcrypt.hash(pass,2);
        console.log(hashedPasswd);
        db.query('INSERT INTO temp SET ?',{user:user,passwd:hashedPasswd,email:mail},(error,results)=>{
            if(error){
                console.log(error);
            } else {
                res.render('register',{
                    message: "User registered"
                });
            }
        });
        //res.send("testing..");
    });
    //res.send("form submitted");
}

exports.login = (req,res)  =>{
    console.log(req.body);
    
    /* const name = req.body.name;
    const mail = req.body.mail;
    const pass = req.body.pass;
    const passcon = req.body.passcon; */

    const {user, pass} = req.body;

    db.query('SELECT pass FROM temp WHERE name = ?',[user], async (error, results) => {
        if(error){
            console.log(error);
        }
        if(results.length > 0){
            return res.render('login',{
                message: 'this name is already in use'
            })
        } else if (pass) {
            return res.render('login',{
                message: 'password is not same!'
            });
        }
        let hashedPasswd = await bcrypt.hash(pass,2);
        console.log(hashedPasswd);
        db.query('INSERT INTO temp SET ?',{user:user,passwd:hashedPasswd,email:mail},(error,results)=>{
            if(error){
                console.log(error);
            } else {
                res.render('login',{
                    message: "User registered"
                });
            }
        });
        //res.send("testing..");
    });
}