const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');
const Vote = require('./vote');

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Comment = Comment;
db.Vote = Vote;

User.init(sequelize);
Post.init(sequelize);
Comment.init(sequelize);
Vote.init(sequelize);

User.associate(db);
Post.associate(db);
Comment.associate(db);
Vote.associate(db);

module.exports = db;
