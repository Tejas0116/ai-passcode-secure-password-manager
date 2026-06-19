const Account = require('../models/Account');
const Activity = require('../models/Activity');
const { encrypt, decrypt } = require('../config/crypto');

// Get all accounts for logged-in user
const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user_id: req.user._id }).sort({ createdAt: 1 });
    
    // Decrypt passwords before sending to the client
    const decryptedAccounts = accounts.map(account => {
      const accountObj = account.toObject();
      accountObj.password = decrypt(account.password, account.iv);
      return accountObj;
    });

    res.json(decryptedAccounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new account
const addAccount = async (req, res) => {
  const { account_name, username, password, link, description } = req.body;

  if (!account_name || !username || !password) {
    return res.status(400).json({ message: 'Account name, username, and password are required' });
  }

  try {
    // Check if account username already exists for THIS user
    const accountExists = await Account.findOne({ user_id: req.user._id, account_name, username });
    if (accountExists) {
      return res.status(400).json({ message: 'An account with this username already exists' });
    }

    // Encrypt the password
    const { encryptedData, iv } = encrypt(password);

    const account = await Account.create({
      user_id: req.user._id,
      account_name,
      username,
      password: encryptedData,
      iv,
      link: link || '',
      description: description || ''
    });

    // Return account with decrypted password for immediate UI display
    const accountObj = account.toObject();
    accountObj.password = password;

    await Activity.create({ user_id: req.user._id, activity: `Added Account: ${account_name}` });

    res.status(201).json(accountObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update account
const updateAccount = async (req, res) => {
  const { id } = req.params;
  const { account_name, username, password, link, description } = req.body;

  try {
    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Verify ownership
    if (account.user_id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (account_name) account.account_name = account_name;
    if (username) account.username = username;
    if (link !== undefined) account.link = link;
    if (description !== undefined) account.description = description;

    if (password) {
      // Re-encrypt the new password
      const { encryptedData, iv } = encrypt(password);
      account.password = encryptedData;
      account.iv = iv;
    }

    const updatedAccount = await account.save();

    const accountObj = updatedAccount.toObject();
    accountObj.password = password || decrypt(updatedAccount.password, updatedAccount.iv);

    await Activity.create({ user_id: req.user._id, activity: `Updated Account: ${account.account_name}` });

    res.json(accountObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Verify ownership
    if (account.user_id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Activity.create({ user_id: req.user._id, activity: `Deleted Account: ${account.account_name}` });

    await Account.findByIdAndDelete(id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount
};
