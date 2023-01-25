const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
           // console.log(results[0].email);
            return res.render('register',{
                message: 'this email is already in use'
            })
        } else if (pass !== passcon) {
            return res.render('register',{
                message: 'password is not same!'
            });
        }
        const hashedPasswd =await bcrypt.hash(pass, 10);
        console.log(hashedPasswd);
        db.query('INSERT INTO temp SET ?',{user:user,passwd:hashedPasswd,email:mail},(error,results)=>{
            if(error){
                console.log(error); 
            } else {
                return res.render('register',{
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
    

    db.query('SELECT passwd FROM temp WHERE user = ?',[user], async (error, results) => {
        if(error){
            
           console.log(error);
        }else if(results.length>0){
               await bcrypt.compare(pass,results[0].passwd, (err, result)=> {
                if (err) { throw (err); }
                else if(result){
                    res.send("login sucessful!");
                    /* return res.render('login',{
                        message: "login sucessfull"
                    }); */
                }
                else{
                    res.send("password worng");
                    console.log("worng password!");
                }
                console.log(result);
            });
        }else{
            res.send("no user exist!");
            console.log("no user exist!");
        }
        
    });
}