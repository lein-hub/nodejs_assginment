const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: Sequelize.STRING(140),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Comment',
        tableName: 'Comments',
        paranoid: false, // deletedAt 안생김
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      },
    );
  }

  static associate(db) {
    db.Comment.belongsTo(db.User); // 게시글은 유저모델에 대해 N : 1 -> belongsTo
    // post.getUser(), post.addUser() 사용 가능해짐
    db.Comment.belongsTo(db.Post);
  }
};
