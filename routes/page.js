const express = require('express');

const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

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

router.get('/', (req, res, next) => {
  const twits = [];
  res.render('main', {
    // main.html 화면 만들어라
    title: 'NodeBird',
    twits,
  });
}); // GET / 요청 처리

module.exports = router;