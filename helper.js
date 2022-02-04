const getUserByEmail = (email, users) => {
  
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
 }


////////////////////////////////////RANDOM STRING GENERATOR//////////////////////////////////
//stack overflow
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);

};








module.exports = {getUserByEmail, generateRandomString}
