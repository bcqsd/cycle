'use strict';

const getUser = require('./controller/get_user');
const postUser = require('./controller/post_user');
const notFound = require('./middleware/not_found');
const parseBody = require('./middleware/parse_body');
const errorHandle = require('./middleware/error_handle');
const accessLog = require('./middleware/access_log');
const Cycle=  require('./cycle');

const app = new Cycle();

// 全局兜底处理
app.use(errorHandle);
// 接口日志记录
app.use(accessLog);
// 404兜底处理
app.use(notFound);
// 解析 Body，存到 `req.body` 供后续中间件使用
app.use(parseBody);

// 路由映射
app.get('/api/v1/user', getUser);
app.post('/api/v1/user', postUser);

// 启动服务
app.listen(3000, () => {
  console.log('Server running at http://127.0.0.1:3000/');
});
