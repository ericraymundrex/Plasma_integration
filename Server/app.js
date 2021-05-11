const express = require('express');
const mongoose = require('mongoose');
const cors=require('cors');
const bcrypt = require('bcrypt');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const session=require('express-session');
const jwt=require('jsonwebtoken');


//-------------------------------------------DO NOT EDIT ABOVE------------------------------------------------
//=================================-----------------=SET-UP=------------------================================
const db = "Users";
// const orgin="http://localhost:3000";
//============================================================================================================
//--------------------------------------------DO NOT EDIT BELOW-----------------------------------------------

const app = express();
app.use(cors({
    // origin:[orgin],
    methods:["GET","POST"],
    credentials:true
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    key:"userId",
    secret:"HelloImsomeonewhodontcareaboutbutitotallycareaboutmylifeiwannadomtechiniitimstudyingshitandforlife",
    resave:false,
    saveUninitialized:false,
    Cookie:{
        expires:60*60*24 
    }
}))
app.use(express.json());
const User = require('./models/user');

//DATABASE CONNECTIVITY
mongoose.connect('mongodb://localhost:27017/'+db, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => { console.log("MONGO CONNECTION OPEN") }).catch(err => {
    console.log("THERE IS A PROBLEM");
    console.log(err)
});

mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));


//Check the Requestes from the Autentic Front-End
const checkFromAutenticFrontEnd=(serverOrgin)=>{
    return true;
    // return serverOrgin==orgin;
}
//Check the validation of email
function emailIsValid (email) {
    return /\S+@\S+\.\S+/.test(email)
}


app.post("/register",async(req,res)=>{

    //NOTE---------------
    //user_find => to find the user => returns null if the user is not found
    //DB SCHEMA {Email,Password,Date:default}
    //Enterd in the DB {user,pass}
    


    //Checking the Request is from the orgin
    if(checkFromAutenticFrontEnd(req.headers.origin)){
        console.log(req.body);
        //Object dereferencing
        const {user,pass}=req.body;

        //Password Encryption
        const hash = await bcrypt.hash(pass, 12);

        User.findOne({Email:user}).then((user_find) => {
            if(user_find){
                // console.log("User exist");
                res.json({auth:false,message:"User exixt"});
            }else{
                // console.log(user+" "+hash);
                // user is from => front-end hash is from bycrypt
                if(emailIsValid(user)){
                    const userTemp=new User({Email:user,Password:hash});
                    userTemp.save();
                    res.json({auth:false,message:"Successfully Registed !"});
                }
                
            }
        });
    }else{
        res.send("Nice try but we wont let you in!");
    }
});

app.post('/login',async(req,res)=>{

    //NOTE---------------
    // user_find => will have {_id,Email,Password,Date}
    // validPassword will only contain true or false
    
    

    //Checking the request from the orgin
    if(checkFromAutenticFrontEnd(req.headers.origin)){
        //Object dereferencing
        const {user,pass}=req.body;


        try {
            let user_find = await User.findOne({ Email:user });
            const validPassword = await bcrypt.compare(pass, user_find.Password);
            
            if (validPassword) {

                //Should not send the password to the front-end
                user_find.Password=null;
                const id=user_find._id;
                const token= jwt .sign({id},"thisissomeoneingreatedrepesssionineedHelp",{
                     expiresIn: 300,
                });
                req.session.user=user_find;
                res.json({auth:true,token:token,user_find});
            }else{
                res.json({auth:false,message:"Email Id or password is wrong!!"});
            }
        }catch(error){
            res.json({auth:false,message:"No user exist"});
        } 
    }else{
        res.send("Nice try but we wont let you in!");
    }
})

app.get("/login", (req,res)=>{
    if(checkFromAutenticFrontEnd(req.headers.origin)){
        if(req.session.user){
            res.send({LoggedIn:true,user:req.session.user});
        }else{
            res.send({LoggedIn:false});
        }
    }else{
        res.send("Nice try but we wont let you in!");
    }
})

//IS-AUTENTICATED
const verifyJWT=(req,res,next)=>{
    const token=req.headers["x-access-token"];
    if(!token){
        res.send("Token is not given");
    }else{
        jwt.verify(token,"thisissomeoneingreatedrepesssionineedHelp",(err,decoded)=>{
            if(err){
                res.json({auth:false,message:"Failed"})
            }else{
                req.user_id=decoded.id;
                next();
            }
        })
    }
}
app.post("/plasma/:id",async(req,res)=>{
    // if(checkFromAutenticFrontEnd(req.header.origin)){
        const id=req.params.id;
        const {Name,PhoneNumber,Age,Weight,Sex,Pincode,BloodGroup,AadharCard,DateOfRecovery,DischargeReport,TestDate,Pregnant}=req.body;
        const TempDetails={Name,PhoneNumber,Age,Weight,Sex,Pincode,BloodGroup,AadharCard,DateOfRecovery,DischargeReport,TestDate,Pregnant};
        try{
            await User.findByIdAndUpdate({_id:id},{
                $push:{
                    detailes: TempDetails
                }
            });
            res.json({message:"Success"});
        }catch(err){
            res.json({message:"Something went wrong"});
        }
    // }
})
app.get("/isUserAuth",verifyJWT,(req,res)=>{
    if(checkFromAutenticFrontEnd(req.headers.origin)){
        res.send("Authenticated");
    }
});

//404 - Page
app.get("*",(req,res)=>{
    res.send("Enter Valid Route 404-ROUTE NOT FOUND");
})
app.listen(3001, () => {
    console.log("SERVER STARTED");
});