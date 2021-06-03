const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  // POST /auth/join
  const { email, nick, pw } = req.body; // 237p 이후로 참고
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(pw, 12); // bcrypt.hash(평문, 반복횟수);
    // 암호화 반복횟수 12회
    await User.create({
      // sequelize 로 users 한 row 생성
      email,
      nick,
      password: hash,
    });
    return res.redirect('/'); // 다시 첫 페이지로
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  // POST /auth/login
  passport.authenticate('local', (authError, user, info) => {
    // passport.authenticate(로그인 전략 설정, 콜백);
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, loginError => {
      // passport.serializeUser() 메소드가 호출된다.
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.post('/profile', isLoggedIn, async (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    // passport.authenticate(로그인 전략 설정, 콜백);
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, loginError => {
      // passport.serializeUser() 메소드가 호출된다.
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.

  const user = await User.update(
    {
      nick: req.body.nick,
      snsId: req.body.snsId == '' ? null : req.body.snsId,
      snsProvider: req.body.snsProvider == '선택' ? null : req.body.snsProvider,
    },
    {
      where: { id: req.user.id },
    },
    console.log(req.body.snsPr),
    res.redirect('/'),
  )
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.error(err);
    });
});

router.get('/logout', isLoggedIn, (req, res) => {
  // GET /auth/logout
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao')); // GET /auth/kakao 로그인 시도

router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    // GET /auth/kakao/callback
    failureRedirect: '/',
  }),
  (req, res) => {
    res.redirect('/');
  },
);

module.exports = router;
