const Sequelize = require('sequelize');

module.exports = class Vote extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Vote',
        tableName: 'votes',
        paranoid: false, // deletedAt 안생김
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      },
    );
  }

  static associate(db) {
    db.Vote.belongsTo(db.User);
    db.Vote.belongsTo(db.Post);
  }
};
