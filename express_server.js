const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");//This tells the Express app to use EJS as its templating engine.

/////////////////////////////////////URL Database//////////////////////////////////////////

/////////showing long and short URLs//////////
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//////////////////////////////////////////////

////////////////////////////////////RANDOM STRING GENERATOR//////////////////////////////////
//stack overflow
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
  
};
//////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////POST REQUEST FOR NEW URLs/////////////////////////////////////
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

/*Note: needs to be added before all the page routes. The body-parser library will convert the 
request body from a Buffer into string that we can read. It will then add the data to the 
req(request) object under the key body.*/

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

/////////passing urlDatabase to express_server.js template/////
//////////////First route/////////////////
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

/*Note: use http://localhost:8080/urls to view URLs. This code is used for handling the route. key is "urls".*/

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

///////////////////////////////NEW URL PAGE////////////////////////////////////////////////////////
//////////////Second route///////////////
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Note:  a GET route to render the urls_new.ejs template (given below) in the browser




/////////////Third route///////////////////
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params.longURL);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]/* What goes here? */ };
  res.render("urls_show", templateVars);
});