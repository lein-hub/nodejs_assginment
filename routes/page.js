const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Comment } = require('../models');
const bcrypt = require('bcrypt');

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

router.post('/profile', isLoggedIn, async (req, res, next) => {
  await User.update(
    {
      nick: req.body.nick,
      snsId: req.body.snsId == '' ? null : req.body.snsId,
      snsProvider: req.body.snsProvider == '선택' ? null : req.body.snsProvider,
      address: req.body.address == '' ? null : req.body.address,
      interest: req.body.interest == '' ? null : req.body.interest,
      occupation: req.body.occupation == '' ? null : req.body.occupation,
      webSite: req.body.webSite == '' ? null : req.body.webSite,
      selfIntro: req.body.selfIntro == '' ? null : req.body.selfIntro,
      avatar: req.body.url == '' ? null : req.body.url,
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
      next(err);
    });
});

router.get('/password', isLoggedIn, async (req, res) => {
  const user = await User.findOne({
    where: { id: req.user.id },
  });
  res.render('password', {
    title: '내 정보 - NodeBird',
    user,
  });
}); // GET /profile/password 요청 처리

// router.post('/password', isLoggedIn, async (req, res, next) => {
//   const user = await User.findOne({
//     where: { id: req.user.id },
//   });

//   const result = await bcrypt.compare(req.body.thisPassword, user.password);
//   console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
//   console.log(result);
//   if (result) {
//     const newPassword = await bcrypt.hash(req.body.newPassword1, 12);
//     await User.update(
//       {
//         password: newPassword,
//       },
//       {
//         where: { id: req.user.id },
//       },
//       res.redirect('/'),
//     )
//       .then(result => {
//         res.json(result);
//       })
//       .catch(err => {
//         console.error(err);
//         next(err);
//       });
//   } else {
//     console.log('땡땡땡땡땡땡땡땡땡땡땡땡땡땡땡땡땡땡');
//     res.redirect('/profile/password');
//   }
// });

router.post('/password', isLoggedIn, async (req, res, next) => {
  const newPw1 = req.body.newPassword1;

  const newPassword = await bcrypt.hash(newPw1, 12);
  await User.update(
    {
      password: newPassword,
    },
    {
      where: { id: req.user.id },
    },
    res.redirect('/'),
  )
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.error(err);
      next(err);
    });
});

router.post('/passwordCheck', isLoggedIn, async (req, res) => {
  const thisPw = req.body.thisPw;

  const user = await User.findOne({
    where: { id: req.user.id },
  });

  const isSame = await bcrypt.compare(thisPw, user.password);
  if (isSame) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' });
}); // GET /join 요청 처리

router.get('/bio', isLoggedIn, (req, res) => {
  res.redirect(`/u/${req.user.id}?content=0&page=1`);
}); // GET /bio 요청 처리

router.get('/u/:userId', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.userId },
    });

    let pageNum = req.query.page; // 요청 페이지 넘버
    let offset = 0;
    let Pcounts = [];
    let Ccounts = [];
    const postNum = 10;
    let end =
      (
        await Post.findAndCountAll({
          where: { UserId: req.params.userId },
        })
      ).count /
      (postNum + 1);
    for (let i = 0; i <= end; i++) Pcounts[i] = i + 1;
    end =
      (
        await Comment.findAndCountAll({
          where: { UserId: req.params.userId },
        })
      ).count /
      (postNum + 1);
    for (let i = 0; i <= end; i++) Ccounts[i] = i + 1;

    if (pageNum > 1) {
      offset = postNum * (pageNum - 1);
    }

    let posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: postNum,
      where: { UserId: req.params.userId },
    });

    let comments = await Comment.findAll({
      include: [{ all: true }],
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: postNum,
      where: { UserId: req.params.userId },
    });

    posts = posts.map(post => {
      post.dataValues.createdAt = dayjs(post.dataValues.createdAt).format(
        'YYYY-MM-DD',
      );
      return post;
    });

    comments = comments.map(post => {
      post.dataValues.createdAt = dayjs(post.dataValues.createdAt).format(
        'YYYY-MM-DD',
      );
      return post;
    });

    if (req.query.content == 0) {
      comments = null;
      Ccounts = null;
    } else {
      posts = null;
      Pcounts = null;
    }

    res.render('userpage', {
      title: `${user.nick}님의 마이페이지 - NodeBird`,
      menu: '마이페이지',
      pageUser: user,
      posts,
      comments,
      Pcounts,
      Ccounts,
      page: pageNum,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/global', (req, res) => {
  // res.json({ result: true });
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

router.post('/qna/:postId/comment', isLoggedIn, async (req, res, next) => {
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

// router.post('/test', async (req, res, next) => {
//   try {
//     const test = await Comment.create({
//       content: 'aaa',
//       UserId: req.user.id,
//       PostId: '1',
//     });
//     res.json(test);
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });

router.get('/write', isLoggedIn, async (req, res, next) => {
  const postId = req.headers.postid;
  let post;
  let isEdit = false;
  if (postId != null) {
    isEdit = true;
    try {
      post = await Post.findOne({
        where: { id: postId },
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
  res.render('write', {
    title: '자주 묻는 질문 - NodeBird',
    menu: 'Q & A',
    post,
    isEdit,
  });
}); // GET /write 요청 처리

router.get('/', (req, res) => {
  res.render('main', {
    // main.html 화면 만들어라
    title: '메인 - NodeBird',
    menu: 'Menu',
  });
}); // GET / 요청 처리

module.exports = router;
