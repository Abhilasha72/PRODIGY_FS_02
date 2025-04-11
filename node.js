const bcrypt = require('bcryptjs');
const hash = '$2b$10$S9QfDimjiPTtCnOvLmPJtOSM3lB2HwMXHusvSRpf9Gjv5mU7TMSmu';
const passwordToTest = 'clar@123'; // Try the password you used
bcrypt.compare(passwordToTest, hash, function(err, result) {
    console.log('Match:', result);
});