const Sequelize = require('sequelize');
const sequelize = require('../config');

// no longer used
const User = sequelize.define('User', { 
  oAuthUserId: { 
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,
  }, 
  oAuthProvider: { 
    type: Sequelize.STRING,
    allowNull: true, 
  },	
  name: { 
    type: Sequelize.STRING, 
    allowNull: true,
    unique: false,
  },
  email: { 
    type: Sequelize.STRING, 
    allowNull: false,
    unique: true,
  },
  username: { 
    type: Sequelize.STRING, 
    allowNull: true, 
    unique: true,
  },
  phoneNumber: { 
    type: Sequelize.STRING,
    allowNull: true, 
    unique: true,
  },
  password: { 
    type: Sequelize.STRING, 
    allowNUll: true,
    unique: false,
  },
  profile: { 
    type: Sequelize.JSON,
    allowNull: true
  }, 
	  tableName: 'identity.users',

  
});

module.exports = User;
