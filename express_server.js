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

/////////passing urlDatabase to express_server.js template/////
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

/*Note: use http://localhost:8080/urls to view URLs. This code is used for handling the route. key is "urls".*/
/////////////Second route///////////////////
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params.longURL);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]/* What goes here? */ };
  res.render("urls_show", templateVars);
});
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




