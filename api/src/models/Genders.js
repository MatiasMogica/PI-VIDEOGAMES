const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    sequelize.define('genders', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ID: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
    });
  };