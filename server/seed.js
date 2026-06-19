const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Account = require('./models/Account');
const Activity = require('./models/Activity');
const bcrypt = require('bcryptjs');
const { encrypt } = require('./config/crypto');

dotenv.config();

const usersData = [
  {
    name: 'Lorem Ipsum',
    phone_number: '09123456678',
    email_address: 'loremipsum@gmail.com',
    username: 'admin',
    password: 'admin' // will be hashed
  }
];

const accountsData = [
  { account_name: 'User Account', username: 'admin', password: 'admin', link: 'http://localhost/password-manager-app/index.php', description: 'awww' },
  { account_name: 'Sourcecodester', username: 'remyandrade', password: 'andrade2341', link: 'https://www.sourcecodester.com/', description: 'Sourcecodester account for code submission' },
  { account_name: 'Facebook', username: 'facebookuser', password: 'facebookpassword', link: 'https://www.facebook.com/', description: 'Second account' },
  { account_name: 'Test', username: 'test1', password: 'test1', link: 'test.com', description: 'Test' },
  { account_name: 'Google Account', username: 'lorem@gmail.com', password: 'lorem123', link: 'https://accounts.google.com/', description: 'Google Main Account' },
  { account_name: 'Google Account', username: 'lorem1@gmail.com', password: 'lorem123', link: 'https://accounts.google.com/', description: 'Google Second Account' },
  { account_name: 'Instagram', username: 'loremipsum123', password: 'ipsum123', link: 'https://www.instagram.com/', description: 'Instagram Main Account' },
  { account_name: 'Instragram', username: 'loremdump', password: 'dump123', link: 'https://www.instagram.com/', description: 'Instagram Dump Account' },
  { account_name: 'Yahoo', username: 'lorem@yahoo.com', password: 'lorem1234', link: 'asdahttps://www.yahoo.com/?guccounter=1', description: 'Yahoo Account' },
  { account_name: 'Twitter', username: 'loremipsum12345', password: 'loremipsum', link: 'https://twitter.com/', description: 'Twitter Account' },
  { account_name: 'asdasdasdsdsa', username: 'asdasdasds232323', password: 'asdasdas', link: 'asdasdasd', description: 'asdasd' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/password_manager_db');
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Account.deleteMany({});
    await Activity.deleteMany({});
    console.log('Existing data cleared.');

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = await Promise.all(
      usersData.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`${createdUsers.length} users seeded.`);
    const adminUser = createdUsers[0];

    // Seed Accounts
    const seededAccounts = accountsData.map((acc) => {
      const { encryptedData, iv } = encrypt(acc.password);
      return {
        user_id: adminUser._id,
        account_name: acc.account_name,
        username: acc.username,
        password: encryptedData,
        iv: iv,
        link: acc.link,
        description: acc.description
      };
    });

    const createdAccounts = await Account.insertMany(seededAccounts);
    console.log(`${createdAccounts.length} accounts seeded.`);

    // Seed Activities
    const seededActivities = [
      { user_id: adminUser._id, activity: 'User Registered', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { user_id: adminUser._id, activity: 'User Logged In', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      { user_id: adminUser._id, activity: 'Added Account: User Account', createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000) },
      { user_id: adminUser._id, activity: 'Added Account: Google Account', createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000) }
    ];
    await Activity.insertMany(seededActivities);
    console.log(`${seededActivities.length} activities seeded.`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
