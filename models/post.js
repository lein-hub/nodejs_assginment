const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: Sequelize.STRING(60),
          allowNull: false,
        },
        content: {
          type: Sequelize.STRING(1000), // 트위터처럼 140자 나타내기
          allowNull: false,
        },
        img: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        good: {
          type: Sequelize.INTEGER(8),
          allowNull: true,
        },
        bad: {
          type: Sequelize.INTEGER(8),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Post',
        tableName: 'posts',
        paranoid: false, // deletedAt 안생김
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      },
    );
  }

  static associate(db) {
    db.Post.belongsTo(db.User); // 게시글은 유저모델에 대해 N : 1 -> belongsTo
    // post.getUser(), post.addUser() 사용 가능해짐
    db.Post.hasMany(db.Comment);
  }
};
