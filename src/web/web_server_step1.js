'use strict';

const http = require('http');
const URL = require('url');
const fs = require('fs');
const path = require('path');

// 处理逻辑
function handler(req, res) {
  // 获取请求的url和method
  const { method, url } = req;
  // 解析url，提取pathname和query参数
  const { pathname, query } = URL.parse(url, true);

  // 匹配请求
  if (method === 'GET' && pathname === '/api/v1/user') {
    const name = query.name;
    // 数据的文件路径
    const dataPath = path.join(__dirname, `../data/${name}.json`);

    // 获取文件内容
    fs.readFile(dataPath, 'utf8', (err, data) => {
      // 有错误返回404
      if (err) {
        // TODO 返回“no user”及404的状态
      }

      // 返回json格式数据
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(data);
      return;
    });

    return;
  }

  // TODO 其他情况兜底404
}

// 启动服务
const server = http.createServer(handler);
server.listen(3000, () => {
  console.log(`Server running at http://127.0.0.1:3000/`);
});