const {getUserByEmail, generateRandomString} = require("../tinyapp2/helper");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");//body parser required to take information from forms.
app.use(bodyParser.urlencoded({ extended: true }));
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

  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", "userid": "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", "userid": "user2RandomID" }
};

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



///////////POST METHOD/////////////////////


app.post("/register", (req, res) => {

  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("Email and Password cannot be blank");
  }
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("An account already exist with this email address");
  }

  const id = generateRandomString(4);
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  }


  req.session.user_id = id;
  res.redirect("/urls");

})

////////////////////////////////POST REQUEST FOR NEW URLs/////////////////////////////////////
app.post("/urls", (req, res) => {

  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  // let user = req.cookies["user_id"];
  let user = req.session.user_id
  urlDatabase[shortURL] = { "longURL": longURL, "userid": user };
  //urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);

});

/////////passing urlDatabase to express_server.js template/////


app.post("/login", (req, res) => {
  console.log("login working");
  const email = req.body.email_L;
  
  const password = req.body.password_L;
  console.log("this password:", password);
  if (password === "" ||email === "") { 
    return res.status(404).send("Password or e-mail value is missing");

  } else {

  

  const user = getUserByEmail(email, users);
  console.log("lets see tinyAPP2", user);
  

  const passwordMatching = bcrypt.compareSync(password, user.password);


  if (!user || !passwordMatching) {
    return res.status(403).send("Incorrect username or password");
  }

  req.session.user_id = user.id;

  return res.redirect("/urls");
  }
});


///////////////////////////////////////LOGOUT USERNAME MAIN PAGE//////////////////////////////////////////////
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
})



///////////////////////////////DELETE SHORT-URL///////////////////////////////////////////////
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    res.status(401).send("Please Login");
  } else {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

///////////////////////////////SUBMIT UPDATED URL/////////////////////////////////////////////

app.post("/urls/:shortURL/edit", (req, res) => {

  const userId = req.session.user_id;

  if (!userId) {
    res.status(401).send("Please Login");

  } else {
    let newURL = req.body.newURL;
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL] = { "longURL": newURL, "userid": userId };
    res.redirect("/urls");
  }
})
///////////////////////////////NEW URL PAGE////////////////////////////////////////////////////////
//////////////Second route///////////////
app.get("/urls/new", (req, res) => {

  if (!req.session.user_id) {
    return res.status(403).send("login first");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);


});

///////////////////////////////EDIT BUTTON to go SHORT URL Page///////////////////////////////
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  console.log(userId);

  if (urlDatabase[req.params.shortURL].userid === userId) {


    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id],
    };


    res.render(`urls_show`, templateVars);
  }

});

//////////////First route/////////////////
app.get("/urls", (req, res) => {
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
  res.redirect("/login");
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
    longURL: urlDatabase[req.params.shortURL],
    user: users[userId]
  };

  console.log("templateVars:", templateVars);
  res.render("urls_show", templateVars);
});

////////////////////////Route to LONG URL page///////////////////////////////////////////////////
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

/////////////////////////////////////////LOGIN USERNAME MAIN PAGE///////////////////////////////////////////
app.get("/login", (req, res) => {
  const templateVars = {
    user: null
  }
  res.render("login", templateVars);
})


//////////////////////////////////////////REGISTER EMAIL AND PASSWORD/////////////////////////////////////
////////////GET METHOD///////////////////
app.get("/register", (req, res) => {
  const templateVars = {
    user: null,
  }

  res.render("registration", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


