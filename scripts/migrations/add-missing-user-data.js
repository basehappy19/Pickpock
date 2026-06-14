const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../../lib/users.json');
const userDataPath = path.join(__dirname, '../../lib/user-data.json');

const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));

let updated = false;
users.forEach(user => {
  if (!userData[user.id]) {
    userData[user.id] = {
      cart: [],
      wishlist: [],
      history: [],
      compare: [],
      coupons: [],
      recentlyViewed: []
    };
    updated = true;
  }
});

if (updated) {
  fs.writeFileSync(userDataPath, JSON.stringify(userData, null, 2));
  console.log('Added missing user data blocks.');
} else {
  console.log('No missing user data found.');
}
