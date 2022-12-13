// EJS or Embedded Javascript Templating is a templating engine used by Node.js. The template engine helps to create an HTML template with minimal code. Also, it can inject data into the HTML template at the client-side and produce the final HTML.It's like DTL(Django Template Language) in Django to access the server side data in front end. This also works similar way!!


// Passport is the authentication middleware for Node. It is designed to serve a singular purpose which is to authenticate requests. It is not practical to store user password as the original string in the database but it is a good practice to hash the password and then store them into the database. But with passport-local-mongoose you don’t have to hash the password using the crypto module, passport-local-mongoose will do everything for you. If you use passport-local-mongoose this module will auto-generate salt and hash fields in the DB. You will not have a field for the password, instead, you will have salt and hash.

// Passport is very easy to integrate NodeJs package, which is used for adding authentication features to our website or web app.This module lets you authenticate using a username and password in your Node.js applications. By plugging into Passport, local authentication can be easily and unobtrusively integrated into any application or framework that supports Connect-style middleware, including Express.

// "passport-local" i.e. the local version of passport that essentially allows us to use usernames and passwords for loggin in. passport has a bunch of different ways we can log in whether it's through Google,Facebook,local password,email,etc.


// In order to store and persist our user across different pages, we need to use express-session. For session to use, first we have to install it.And to display messages for if we fail to login we install and use "express-flash" which is used by passport inside internals to display those nice handy messages for wrong emails,wrong password,etc.

if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');


const initializePassport = require('./passport-config'); // what it is returning function or anything else, think over it???
initializePassport(passport,
    email => users.find(user => user.email === email),//fn to find the user based on the email
    id => users.find(user => user.id === id) // fn to find the user based on the id
)

const users = [] // taking array instead of database for simplicity

// In order to use "ejs" we have to tell to our server that we are using "ejs", will do this by setting the "view-engine" as "ejs", will do the following way
app.set('view-engine','ejs'); // this is why we installed "ejs" dependency

app.use(express.urlencoded({extended:false})) // all of this is doing is it's telling our application that what we want to do is take these forms values from email and password and we want to be able to access them inside of our request variable inside our post method.
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET, // this is the key that we want to keep as secret which is going to encrypt all of our information for us and this we are giving from our environment variable that we will set ourselves
    resave: false, // essentially this says should we resave our session variables if nothing has changed. In our case we don't want to resave it if nothing has changed.
    saveUninitialized:false // this is saying do you want to save an empty value in the session if there is no value and we actually don't want to do
}))
app.use(passport.initialize()) // this is a function inside passport which is going to set some of the basics for us
app.use(passport.session()) // since we want to store our variables to be persisted across the entire session our user has,we have to use this("passport.session") which is going to work with our "app.use(session)"
app.use(methodOverride('_method'));


app.get('/',checkAuthenticated, (req,res)=>{ // home page of our login application
    res.render('index.ejs',{name:req.user.name});
})

app.get('/login',checkNotAuthenticated,(req,res)=>{ // it will be used to load(render) the login page
    res.render('login.ejs');

})

app.post('/login', checkNotAuthenticated, passport.authenticate('local',{ // now instead of fn(req,res) we will use middleware
    successRedirect:'/', // if it succeed it will redirect to home page
    failureRedirect:'/login', // if it fails it will redirect back to the login page
    failureFlash:true // if failure it will make sure that we show a message, it is just going to let us have a flash message which we can disply to the user which is going to be equal to our message that we wrote in the "authenticateUser" fn in "passport-config.js" file depending on the error we get.
}))

app.get('/register',checkNotAuthenticated,(req,res)=>{ // this will be used to render(load) register page
    res.render('register.ejs');
})

app.post('/register',checkNotAuthenticated, async (req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password,10); 
        users.push({
            id:Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword

        })
        res.redirect('/login')
    } catch(err){
        // if any prblm occurs,we will redirect it back to register page
        res.redirect('/register')
    }

    console.log(users);
})


app.delete('/logout',(req,res)=>{
    req.logOut(); // this logout fn is again something that passports sets up for us automatically.it will clear our session and log our user out. In order to call this delete function, we can't actually do that directly from HTML what we need to use is we need to use a form and we need to post but since delete is not actually supported by forms we can only use post, So we need to use another library that's called "method-override". What is allows to do is actually override method that we were using and so instead of using post, we can actually call this delete method here. 
    res.redirect('/login');
})

// In order to not allow non logged in users to access the information, so let's work on protecting all of our different routes for when we are not logged in. For this to do we will make a new function with name "checkAuthenticated()"

function checkAuthenticated(req,res,next){ // this is essentially a middleware function which is just going to take our request and response and a next variable that we call whenever we're done(finishing up our authentication). Here we are simply checking whethere users are authenticated or not

    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/login'); // if user is not authenticated then we will redirect it to the login page.

}


function checkNotAuthenticated(req,res,next){ // this fn will ensure that if we are are already logged in then we can't go back to the login page, similarly for register, etc
    if(req.isAuthenticated()){ // if user is authenticated, then we will redirect it to home page
        return res.redirect('/') 
    }
    next() // if not authenticated, we just want to continue on with the call

} // WE CAN PUT THIS 'checkNotAuthenticated' in all the places we want to check to see if user is not authenticated.
app.listen(3000,()=>{
    console.log("Server is Running");
})