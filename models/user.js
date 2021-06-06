const Sequelize = require('sequelize');

module.exports = class user extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: false,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'local',
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        snsProvider: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        interest: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        occupation: {
          type: Sequelize.STRING(40),
          allowNull: true,
        },
        webSite: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        address: {
          type: Sequelize.STRING(40),
          allowNull: true,
        },
        selfIntro: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      },
    );
  }

  static associate(db) {
    db.User.hasMany(db.Post);
    db.User.hasMany(db.Comment);
  }
};
