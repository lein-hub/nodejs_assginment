const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Comment } = require('../models');
const isLoggedIn = require('./middlewares').isLoggedIn;

const router = express.Router();

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads/');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    await Post.create({
      title: req.body.title,
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    res.redirect('/qna');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/edit', isLoggedIn, async (req, res, next) => {
  try {
    let posttt = await Post.findOne({
      where: { id: req.body.postId },
    });

    if ((req.body.url && posttt.img) || req.body.url == 'DELETED') {
      fs.unlink(`./uploads${posttt.img.slice(4)}`, err => {
        if (err) {
          console.log(err);
        }
        console.log('file deleted');
      });
    }

    await Post.update(
      {
        title: req.body.title,
        content: req.body.content,
        img:
          req.body.url == ''
            ? posttt.img
            : req.body.url == 'DELETED'
            ? ''
            : req.body.url,
      },
      {
        where: { id: req.body.postId },
      },
      res.redirect(`/qna/${req.body.postId}`),
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/getComment', isLoggedIn, async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      where: { id: req.body.commentId },
    });
    res.json(comment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/getCmtCnt', async (req, res, next) => {
  try {
    const comment = await Comment.findAndCountAll({
      where: { PostId: req.body.postId },
    });
    res.json(comment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/delete', isLoggedIn, async (req, res, next) => {
  try {
    let post = await Post.findOne({
      where: { id: req.body.postId },
    });
    fs.unlink(`./uploads${post.img.slice(4)}`, err => {
      if (err) {
        console.log(err);
      }
      console.log('file deleted');
    });
    await Post.destroy(
      {
        where: { id: req.body.postId },
      },
      res.redirect('/qna/'),
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/deleteComment', isLoggedIn, async (req, res, next) => {
  try {
    await Comment.destroy({
      where: { id: req.body.commentId },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
  res.json({ result: true });
});

router.post('/editComment', isLoggedIn, async (req, res, next) => {
  try {
    await Comment.update(
      {
        content: req.body.content,
      },
      {
        where: { id: req.body.commentId },
      },
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
