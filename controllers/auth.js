const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());

const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
}); 

exports.register = (req, res)=>{
    //console.log(req.body);
    
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


let refreshtoken=[];

exports.login = (req,res)  =>{
   // console.log(req.body);
    
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
                    //res.send("login sucessful!");
                    const juser={name:user}
                    const token = jwt.sign(juser,process.env.access_token_secret,{expiresIn:'6s'});
                    const rtoken = jwt.sign(juser,process.env.refres_token_secret);
                    refreshtoken.push(rtoken);

                    //cookie
                    const options={
                        expires:new Date(Date.now()+7*24*60*60*1000),
                        httpOnly:true
                    }
                    res.status(201).cookie("token",token,options)/* .json({
                        success:true,
                        token
                    }); */
                    res.status(201).cookie("rtoken",rtoken,options)
                    console.log("cookie "+req.Cookies);
                    //res.json({token:token});
                    return res.render('login',{
                        message: "login sucessfull token:"+token
                    });
                }
                else{
                    res.send("password worng");
                    console.log("worng password!");
                }
               // console.log(result);
            });
        }else{
            res.send("no user exist!");
            console.log("no user exist!");
        }
        
    });
}

exports.authenticateJWT = (req, res, next) => {
    //console.log("cookies: "+req.cookies);
    const token = req.cookies.token;
    const rtoken= req.cookies.rtoken;
  
    if (token) {
      jwt.verify(token,process.env.access_token_secret, (err, user) => {
        if (err) {
            if(refreshtoken.includes(rtoken)){
                jwt.verify(rtoken,process.env.refres_token_secret,(err,user)=>{
                    if(err){
                        res.redirect("/login");
                    }
                    else{
                        const juser={name:user.name}
                        console.log("rrrrr",user);
                        const token = jwt.sign(juser,process.env.access_token_secret,{expiresIn:'6s'});
                        const options={
                            expires:new Date(Date.now()+1*24*60*60*1000),
                            httpOnly:true
                        }
                        res.status(201).cookie("token",token,options);
                        res.redirect("/login");
                    }
                })
            }
          
        } else {
          // Valid token
          console.log("valid:",user);
          req.user = user;
          next();
        }
      });
    } else {
      // No token found
      res.status(401).redirect("/login");
    }
  };
  