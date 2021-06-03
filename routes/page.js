const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const dayjs = require('dayjs');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Comment } = require('../models');
const { CLIEngine } = require('eslint');

router.use((req, res, next) => {
  // 라우터에서 사용되는 미들웨어 정의
  // res.locals.user = null;  // res.locals -> 넌적스에서 사용
  res.locals.user = req.user;
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followerIdList = [];
  next();
});

router.get('/profile', isLoggedIn, async (req, res) => {
  const user = await User.findOne({
    where: { id: req.user.id },
  });
  res.render('profile', {
    title: '내 정보 - NodeBird',
    user,
  });
}); // GET /profile 요청 처리

router.get('/profile/password', isLoggedIn, async (req, res) => {
  const user = await User.findOne({
    where: { id: req.user.id },
  });
  res.render('password', {
    title: '내 정보 - NodeBird',
    user,
  });
}); // GET /profile/password 요청 처리

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' });
}); // GET /join 요청 처리

router.get('/bio', (req, res) => {
  res.render('bio', {
    title: '자기소개 - NodeBird',
    menu: '자기소개',
  });
}); // GET /bio 요청 처리

router.get('/global', (req, res) => {
  res.render('global', {
    title: '현지학기제 - NodeBird',
    menu: '현지학기제',
  });
}); // GET /global 요청 처리

router.get('/qna', async (req, res, next) => {
  try {
    let pageNum = req.query.page; // 요청 페이지 넘버
    let offset = 0;
    let counts = [];
    const postNum = 20;
    const end = (await Post.findAndCountAll()).count / (postNum + 1);
    for (let i = 0; i <= end; i++) counts[i] = i + 1;

    if (pageNum > 1) {
      offset = postNum * (pageNum - 1);
    }

    let posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      // include: {
      //   model: Comment.findAndCountAll({}),
      //   attributes: ['count'],
      // },
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: postNum,
    });
    posts = posts.map(post => {
      post.dataValues.createdAt = dayjs(post.dataValues.createdAt).format(
        'YYYY-MM-DD',
      );
      return post;
    });
    res.render('qna', {
      title: '자주 묻는 질문 - NodeBird',
      menu: 'Q & A',
      posts,
      counts,
      page: pageNum,
    });
    console.log(end);
  } catch (error) {
    console.error(error);
    next(error);
  }
}); // GET /qna 요청 처리

router.get('/qna/:postId', async (req, res, next) => {
  try {
    let post = await Post.findOne({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      where: { id: req.params.postId },
    });
    let comments = await Comment.findAll({
      include: {
        model: User,
        attributes: ['nick'],
      },
      where: { postId: req.params.postId },
    });
    comments = comments.map(comment => {
      comment.dataValues.createdAt = dayjs(comment.dataValues.createdAt).format(
        'YYYY-MM-DD hh:mm',
      );
      return comment;
    });
    res.render('content', {
      title: '자주 묻는 질문 - NodeBird',
      menu: 'Q & A',
      post,
      comments,
      date: dayjs(post.createdAt).format('YYYY-MM-DD'),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}); // GET /qna 요청 처리

router.post('/qna/:postId/comment', async (req, res, next) => {
  try {
    await Comment.create({
      content: req.body.content,
      UserId: req.user.id,
      PostId: req.params.postId,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/write', isLoggedIn, (req, res) => {
  res.render('write', {
    title: '자주 묻는 질문 - NodeBird',
    menu: 'Q & A',
  });
}); // GET /write 요청 처리

router.get('/', (req, res, next) => {
  res.render('main', {
    // main.html 화면 만들어라
    title: '메인 - NodeBird',
    menu: 'Menu',
  });
}); // GET / 요청 처리

module.exports = router;
