const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



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

