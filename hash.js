const bcrypt = require('bcryptjs');
const password = 'yourpassword123'; // Choose a password
const saltRounds = 10;
bcrypt.hash(password, saltRounds, function(err, hash) {
  console.log(hash);
});