'use strict';

const http = require('http');

// 处理逻辑
function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.end('Hello Node\n');
}

// 启动服务
const server = http.createServer(handler);
server.listen(3000, () => {
  console.log(`Server running at http://127.0.0.1:3000/`);
});