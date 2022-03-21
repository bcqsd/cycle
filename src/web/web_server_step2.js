'use strict';

const http = require('http');
const URL = require('url');
const fs = require('fs');
const path = require('path');

// 处理逻辑
function handler(req, res) {
  const { method, url } = req;
  const { pathname, query } = URL.parse(url, true);

  // 错误处理函数
  function errorHandler(status, err) {
    console.error(`[Error] ${req.method} ${req.url}`, err);

    res.statusCode = status;
    res.statusMessage = err.message;

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: err.message,
    }));
  }

  if (method === 'GET' && pathname === '/api/v1/user') {
    const name = query.name;
    const dataPath = path.join(__dirname, `../data/${name}.json`);

    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) return errorHandler(404, new Error('no user'));;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: JSON.parse(data),
      }));
      return;
    });

    return;
  }
  /**
   * 
   */

  if (method === 'POST' && pathname === '/api/v1/user') {
    // 需监听事件接收 Body
    const buffer = [];

    req.on('data', chunk => {
      buffer.push(chunk);
    });

    req.on('end', () => {
      // 解析 Body
      const insert = JSON.parse(Buffer.concat(buffer).toString());

      // TODO 数据校验（没有name属性返回“name required”及422状态）422状态码代表什么？
      // TODO 将输入的name作为文件名存储输入的内容，注意错误情况的处理
      // 写文件文档: https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#filehandlewritefiledata-options
      // fs.writeFile(path, content, callback);
    });
    return;
  }

  errorHandler(200, { message: 'not found' });
}

// 启动服务
const server = http.createServer(handler);
server.listen(3000, () => {
  console.log(`Server running at http://127.0.0.1:3000/`);
});