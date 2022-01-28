const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");//body parser required to take information from forms.
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));



app.set("view engine", "ejs");//This tells the Express app to use EJS as its templating engine.


/////////////////////////////////////URL Database////////////////////////////////////////////

/////////showing long and short URLs//////////
const urlDatabase = {

  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", "userid": "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", "userid": "user2RandomID" }
};
//////////////////////////////////////////////

//////////////USER DATABASE//////////////
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

////////////////////////////////////RANDOM STRING GENERATOR//////////////////////////////////
//stack overflow
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
  
};
//////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////Email finder
const findUser = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

///////////POST METHOD/////////////////////


app.post("/register", (req,res) => {
  
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("Email and Password cannot be blank");
  }
  const user = findUser(email);
  if (user) {
    return res.status(400).send("An account already exist with this email address");
  }

  const id = generateRandomString(4);
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  }

  //res.cookie('user_id',id);
  req.session.user_id = id;
  res.redirect("/urls");

})

////////////////////////////////POST REQUEST FOR NEW URLs/////////////////////////////////////
app.post("/urls", (req, res) => {
    
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  // let user = req.cookies["user_id"];
  let user = req.session.user_id
  urlDatabase[shortURL] = { "longURL": longURL, "userid": user};
  //urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
  
});

/////////passing urlDatabase to express_server.js template/////


app.post("/login", (req,res) => {
  console.log("login working");
  const email = req.body.email_L;
  const password = req.body.password_L; 
  
  const user = findUser(email);

  const passwordMatching = bcrypt.compareSync(password, user.password);
  

  if (!user || !passwordMatching) {
        return res.status(403).send("Incorrect username or password");
  }


  
    //  res.cookie('user_id', user.id);
     req.session.user_id = user.id;

     return res.redirect("/urls");
  
  // } else {
  //   return res.status(403).send("Incorrect username or password");

  // }
  // let username = req.body.Login;
  // console.log(username);
  //res.cookie('username',username);
});


///////////////////////////////////////LOGOUT USERNAME MAIN PAGE//////////////////////////////////////////////
app.post("/logout", (req,res) => {
  //let  username = req.cookies["username"];
  res.clearCookie('user_id');
  //const userId = req.cookies.user_id;
  // let urls =  urlDatabase[req.params.shortURL]
  // const templateVars = {
  //   user: userId,
  //   urls
  // }
  res.redirect('/login');
  // res.render("urls_index", templateVars);
})



///////////////////////////////DELETE SHORT-URL///////////////////////////////////////////////
app.post("/urls/:shortURL/delete", (req, res) => {
  //const userId = req.cookies.user_id;
  const userId = req.session.user_id;

  if (!userId) {
    res.status(401).send("Please Login");

  } else {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////SUBMIT UPDATED URL/////////////////////////////////////////////

app.post("/urls/:shortURL/edit", (req,res) => {
  // const userId = req.cookies.user_id;
  const userId = req.session.user_id;

  if (!userId) {
    res.status(401).send("Please Login");

  } else {
  let newURL = req.body.newURL;
  let shortURL = req.params.shortURL;
  //let user = req.cookies["user_id"];
  urlDatabase[shortURL] = { "longURL": newURL, "userid": userId};
  res.redirect("/urls");

  // const shortURL = req.params.shortURL;
  // const longURL = urlDatabase[shortURL];
  // urlDatabase.push({
  //   shortURL: req.body.newURL
    // })  
  }
})  
///////////////////////////////NEW URL PAGE////////////////////////////////////////////////////////
//////////////Second route///////////////
app.get("/urls/new", (req, res) => {


  // if (!req.cookies.user_id) 
  if (!req.session.user_id) {
    return res.status(403).send("login first");
  }  
  const templateVars = {
    //username: req.cookies["username"],
    urls: urlDatabase,
    // user: users[req.cookies.user_id]
    user: users[req.session.user_id]
    //email: users[req.cookies.user_id].email,
    
    // ... any other vars
  };  
  res.render("urls_new", templateVars);
  
  
});  

///////////////////////////////EDIT BUTTON to go SHORT URL Page///////////////////////////////
app.get("/urls/:shortURL", (req,res) => {
  // const userId = req.cookies["user_id"];
  const userId = req.session.user_id;
  console.log(userId);

      if (urlDatabase[req.params.shortURL].userid === userId) {   

    
  const templateVars = { shortURL: req.params.shortURL,    
                         longURL: urlDatabase[req.params.shortURL].longURL, 
                         //username: req.cookies["username"]
                         user: users[req.cookies.user_id],
                         //email: users[req.cookies.user_id].email,
                        }; 

  
  res.render(`urls_show`, templateVars);                      
      }

});      

//////////////First route/////////////////
app.get("/urls", (req, res) => {
  // const userId = req.cookies.user_id;
  const userId = req.session.user_id;
  console.log(userId);
  const userURLs = {};

  if (!userId) {
    res.status(401).send("Please Login");

  } else {

    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userid === userId) {
        userURLs[shortURL] = urlDatabase[shortURL];

      }  

    }  

    const templateVars = {
      urls: userURLs,
      user: users[userId],
    };  

    console.log(templateVars);

    res.render("urls_index", templateVars);
  }  
});  



////////////////////////////////////////MAIN PAGE///////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});


//////////////////////////////////URL Database visibile////////////////////////////////////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});


/////////////Third route///////////////////
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  console.log("this is the one:", users[userId]);
  
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]/* What goes here? */,
    user: users[userId]/*username: req.cookies["username"]*/
  };

  console.log("templateVars:", templateVars);
  res.render("urls_show", templateVars);


});

////////////////////////Route to LONG URL page///////////////////////////////////////////////////
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

/////////////////////////////////////////LOGIN USERNAME MAIN PAGE///////////////////////////////////////////
app.get("/login", (req,res) => {
  const templateVars = {
    user: null
  }
  res.render("login", templateVars);
  
})


//////////////////////////////////////////REGISTER EMAIL AND PASSWORD/////////////////////////////////////
////////////GET METHOD///////////////////
app.get("/register", (req,res) => {
  const templateVars = {
    user: null,
  }
  
  res.render("registration", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
