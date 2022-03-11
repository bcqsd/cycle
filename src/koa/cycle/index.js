'use strict';

const http = require('http');
const URL = require('url');

module.exports = class Cycle {
  constructor() {
    this.middlewares = [];

    // 注册语法糖，app.get() / app.post()
    for (const method of [ 'GET', 'POST', 'DELETE', 'PUT', 'HEAD', 'PATCH' ]) {
      this[method.toLowerCase()] = (pattern, fn) => {
        this.middlewares.push({ method, pattern, fn });
        return this;
      };
    }
  }

  // 挂载中间件
  use(pattern, fn) {
    // 支持单个入参 `use(fn)` 形式
    if (fn === undefined && typeof pattern === 'function') {
      fn = pattern;
      pattern = undefined;
    }
    // 保存
    this.middlewares.push({
      pattern,
      fn,
    });
    // 返回自己，方便链式调用
    return this;
  }

  // 路由匹配
  _match(req, rule) {
    const { pattern, method } = rule;
    if (method && method !== req.method) return false;
    if (!pattern) return true;

    const { pathname } = req;

    if (typeof pattern === 'string') {
      return pathname === pattern;
    } else if (pattern instanceof RegExp) {
      // 正则表达式
      const match = pathname.match(pattern);
      if (!match) return false;

      // 把匹配的分组结果存入 `req.params`
      req.params = match.slice(1);
      return true;
    }
  }

  // 把 reqest/response 封装为 context 上下文
  _patch(req, res) {
    const { url, method, headers } = req;
    const { pathname, query } = URL.parse(url, true);

    const ctx = {
      // 原始对象
      req,res,

      // 代理请求对象
      url, method, headers, pathname, query,

      // 代理响应对象
      set(key, value) { this.res.setHeader(key, value); },
      get(key) { return this.res.getHeader(key); },
      set status(code) { this.res.statusCode = code; },
      get status() { return this.res.statusCode; },

      // 对响应 Body 多一层代理封装
      _body: undefined,
      get body() { return this._body; },
      set body(value) { this._body = value;},

      // 错误处理 ctx.throw(422, 'name required') / ctx.throw(new Error('invalid'))
      throw(status, message) {
        const error = new Error(message);
        error.status = status;
        throw error;
      },
    };

    return ctx;
  }

  // 处理函数
  handler(req, res) {
    // 一个请求创建一个上下文
    const ctx = this._patch(req, res);

    // 实现回溯中间件模型
    let i = 0;
    const next = () => {
      const rule = this.middlewares[i++];
      // 没有待执行的中间件 => 完成（resolve）整个中间件模型
      if (!rule) return Promise.resolve();
      // 路由中间件 & 路由匹配失败 => 不执行该中间件
      if (!this._match(ctx, rule)) return next();

      try {
        // 执行中间件
        return Promise.resolve(rule.fn(ctx, next));
      } catch (err) {
        // 有error => 置为失败态，不继续向下执行，直接throw
        return Promise.reject(err);
      }
    };

    // 执行
    next().then(() => {
      // 全部执行完成 => 最终写入 Header 和 Body
      if (typeof ctx.body === 'string') {
        res.end(ctx.body);
      } else if (Buffer.isBuffer(ctx.body)) {
        res.end(ctx.body.toString());
      } else {
        ctx.set('Content-Type', 'application/json');
        res.end(JSON.stringify(ctx.body));
      }
    }).catch(err => {
      console.log(err);
      ctx.status = 500;
      ctx.message = err.message;
    });
  }

  // 启动服务
  listen(port, callback) {
    this.server = http.createServer(this.handler.bind(this));
    this.server.listen(port, callback);
  }
};