const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user',{
      id:{
         type:Sequelize.INTEGER,
         allowNull:false,
         autoIncrement:true,
         primaryKey:true
      },
      search:{
          type:Sequelize.STRING
      },
      userName :{
          type:Sequelize.STRING,
          allowNull:false
      },
      email:{
         type:Sequelize.STRING,
         allowNull:false
      },
      password:{
         type:Sequelize.STRING,
         allowNull:false
      },
      feedback : {
         type : Sequelize.INTEGER
      }
})

module.exports = User;