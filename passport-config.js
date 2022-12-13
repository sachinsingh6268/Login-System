// after installing "express-session" and "express-flash", we will set up our passport to be working with our login and while could put all this information into our "server.js" file, it will quickly going to become quite large and bloated. So for these reasons We have created this seperate file and in here we are going to put all of our different passport related information and we are gonna do it all inside a function as shown below

const { emit } = require('nodemon')

const localStrategy = require('passport-local').Strategy // it is our local strategy
const bcrypt = require('bcrypt') // it will be used to hash password passed




function initialize(passport,getUserByEmail,getUserById){
    userAuthenticate = async (email,password,done) => { // We will call the done function whenever we are done with authenticating our user
        const user = getUserByEmail(email);
        if(user == null){
            return done(null,false,{message:"No user with this email !!"});// false tell that no user is there
        }
    
        // as bcrypt is an asynchrounous library, so will wrap it in try,catch statement
        try{
            if(await bcrypt.compare(password,user.password)){
                return done(null,user);
            } else{
                return done(null,false,{message:"Incorrect Password !!"});
            }
    
        } catch(err){
            return done(err)
        }
    
    }
    passport.use(new localStrategy({usernameField:'email'},userAuthenticate)) // 2nd arguement is a fn which is going to be the fn that this is going to call to authenticate our user.

    passport.serializeUser((user,done)=> done(null,user.id)) // here user id is actual serialized version of our user
    passport.deserializeUser((id,done)=>{
        return done(null,getUserById(id))
     })
}




module.exports = initialize



// Where does user.id go after passport.serializeUser has been called?
// The user id (you provide as the second argument of the done function) is saved in the session and is later used to retrieve the whole object via the deserializeUser function.

// serializeUser determines which data of the user object should be stored in the session. The result of the serializeUser method is attached to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide the user id as the key) req.session.passport.user = {id: 'xyz'}

// We are calling passport.deserializeUser right after it where does it fit in the workflow?
// The first argument of deserializeUser corresponds to the key of the user object that was given to the done function. So your whole object is retrieved with help of that key. That key here is the user id (key can be any key of the user object i.e. name,email etc). In deserializeUser that key is matched with the in memory array / database or any data resource.

// The fetched object is attached to the request object as req.user