exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // req.isAuthenticated(): passport모듈에서 구현 되어있는 메소드
    // 인증되었으면 true, 그렇지 않으면 false
    next();
  } else {
    // res.status(403).send('로그인 필요');
    res.render('login', {
      title: '로그인 - NodeBird',
      menu: 'Menu',
    });
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.');
    res.redirect(`/?error=${message}`);
  }
};
