const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");//body parser required to take information from forms.
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
/*Note: needs to be added before all the page routes. The body-parser library will convert the 
request body from a Buffer into string that we can read. It will then add the data to the 
req(request) object under the key body.*/

app.set("view engine", "ejs");//This tells the Express app to use EJS as its templating engine.


/////////////////////////////////////URL Database////////////////////////////////////////////

/////////showing long and short URLs//////////
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//////////////////////////////////////////////

//////////////USER DATABASE//////////////
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
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


///////////////////////////////DELETE SHORT-URL///////////////////////////////////////////////
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
//////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////SUBMIT UPDATED URL/////////////////////////////////////////////

app.post("/urls/:shortURL/edit", (req,res) => {
  let newURL = req.body.newURL;
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newURL;
  res.redirect("/urls");

  // const shortURL = req.params.shortURL;
  // const longURL = urlDatabase[shortURL];
  // urlDatabase.push({
  //   shortURL: req.body.newURL
  // })  
  
})
///////////////////////////////NEW URL PAGE////////////////////////////////////////////////////////
//////////////Second route///////////////
app.get("/urls/new", (req, res) => {
  const templateVars = {
    //username: req.cookies["username"],
    urls: urlDatabase,
    user: users[req.cookies.user_id]
    //email: users[req.cookies.user_id].email,
    
    // ... any other vars
  };
  res.render("urls_new", templateVars);
  
  
});

//Note:  a GET route to render the urls_new.ejs template (given below) in the browser
///////////////////////////////EDIT BUTTON to go SHORT URL Page///////////////////////////////
app.get("/urls/:shortURL", (req,res) => {
  const templateVars = { shortURL: req.params.shortURL,
                         longURL: urlDatabase[req.params.shortURL], 
                         //username: req.cookies["username"]
                         user: users[req.cookies.user_id],
                         //email: users[req.cookies.user_id].email,
                        };

  const shortURL = req.params.shortURL;
  res.render(`urls_show`, templateVars);

});
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////First route/////////////////
app.get("/urls", (req, res) => {
  // const templateVars = { urls: urlDatabase,
  //  };
  // res.render("urls_index", templateVars);
  // console.log(req.cookies['username']);
  const templateVars = {
    //username: req.cookies["username"],
    urls: urlDatabase,
    user: users[req.cookies.user_id],
    //email: users[req.cookies.user_id].email,
    // ... any other vars
  };
  console.log(templateVars);
  console.log()
 
  res.render("urls_index", templateVars);
});

/*Note: use http://localhost:8080/urls to view URLs. This code is used for handling the route. key is "urls".*/




////////////////////////////////POST REQUEST FOR NEW URLs/////////////////////////////////////
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
  
});

/////////passing urlDatabase to express_server.js template/////



////////////////////////////////////////MAIN PAGE///////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});


///////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////When we: express_server.js and server starts//////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

///////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////URL Database visibile////////////////////////////////////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/*Note: visit: http://localhost:8080/urls.json,to see a JSON string representing 
the entire urlDatabase object*/
///////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////Hello World test code///////////////////////////////////////////////
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });



app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

/*Note: visit http://localhost:8080/hello to see the result */

///////////////////////////////////////////////////////////////////////////////////////////



/////////////Third route///////////////////
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params.longURL);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]/* What goes here? */, username: req.cookies["username"] };
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

app.post("/login", (req,res) => {
  console.log("login working");
  const email = req.body.email_L;
  const password = req.body.password_L;
 
  
  const user = findUser(email);
  console.log(user);
  if (!user) {
        return res.status(400).send("Incorrect credentials");
  }
  if (user.password === password) {
     res.cookie('user_id', user.id);
     return res.redirect("/urls");
  }
  // let username = req.body.Login;
  // console.log(username);
  //res.cookie('username',username);
})


///////////////////////////////////////LOGOUT USERNAME MAIN PAGE//////////////////////////////////////////////
app.post("/logout", (req,res) => {
  console.log("workds");
  //let  username = req.cookies["username"];
  res.clearCookie('user_id');
  res.redirect('/urls');
})


//////////////////////////////////////////REGISTER EMAIL AND PASSWORD/////////////////////////////////////
////////////GET METHOD///////////////////
app.get("/register", (req,res) => {
  const templateVars = {
    user: null,
  }
  
  res.render("registration", templateVars);
});



////////////POST METHOD/////////////////////


app.post("/register", (req,res) => {
  
  let email = req.body.email;
  let password = req.body.password;

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
    password: password
  }

  console.log(users);
  console.log(res.cookie('user_id',id));

  res.cookie('user_id',id);
  res.redirect("/urls");

})
