const express = require('express');

const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');
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

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
}); // GET /profile 요청 처리

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' });
}); // GET /join 요청 처리

router.get('/bio', (req, res) => {
  res.render('bio', { title: '자기소개 - NodeBird' });
}); // GET /bio 요청 처리

router.get('/global', (req, res) => {
  res.render('global', { title: '현지학기제 - NodeBird' });
}); // GET /global 요청 처리

router.get('/qna', isLoggedIn, async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('qna', {
      title: '자주 묻는 질문 - NodeBird',
      posts,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}); // GET /qna 요청 처리

router.get('/', (req, res, next) => {
  const twits = [];
  res.render('main', {
    // main.html 화면 만들어라
    title: 'NodeBird',
    twits,
  });
}); // GET / 요청 처리

module.exports = router;
