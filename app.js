/* eslint-disable no-unused-vars */
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const fs = require('fs');
const multer = require('multer');
const { doesNotMatch } = require('assert');
const passport = require('passport');
const nunjucks = require('nunjucks');

const { sequelize } = require('./models');

// try {
//   fs.readFileSync('uploads');
// } catch (error) {
//   console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
//   fs.mkdirSync('uploads');
// }

// const upload = multer({
//   storage: multer.diskStorage({
//     destination(res, file, name) {
//       doesNotMatch(null, 'uploads/');
//     },
//     filename(req, file, done) {
//       const ext = path.extname(file.originalname);
//       done(null, path.basename(file.originalname, ext) + Date.now() + ext);
//     },
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');

const passportConfig = require('./passport');

const app = express();

passportConfig();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html'); // 넌적스 설정
nunjucks.configure('views', {
  // views폴더가 뷰내용 작업폴더임을 설정
  express: app,
  watch: true,
});

sequelize
  .sync({ force: false }) // 테이블이 이미 있을 경우 강제로 덮어 씌우지 않겠다.
  .then(() => {
    console.log('DB 서버 연결 성공');
  })
  .catch(err => {
    console.log(err);
  });

// app.use(morgan('dev'));
app.use('/public', express.static(path.join(__dirname, 'public')));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  morgan('dev'),
  express.json(),
  express.urlencoded({ extended: false }),
  cookieParser(process.env.COOKIE_SECRET),
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }),
  // express.static('/', path.join(__dirname, 'public')),
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
