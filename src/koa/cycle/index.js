import fs from 'fs'
import URL from 'url'
import http, { get } from 'http'
import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
export class Cycle {
  constructor() {
    this.middlewares = []
    for (const method of ['GET', 'POST', "DELETE", 'PUT', 'HEAD', 'PATCH']) {
      // cycle.get('/api',callback)
      this[method.toLowerCase()] = (pattern, fn) => {
        this.middlewares.push({ method, pattern, fn })
        return this
      }
    }
  }
  use(pattern, fn) {
    //支持单个入参fn
    if (fn == undefined && typeof pattern === 'function') {
      fn = pattern
      pattern = undefined
    }
    this.middlewares.push({ pattern, fn })
    //链式调用
    return this
  }
  //路由匹配
  _match(req, rule) {
    const { pattern, method } = rule
    if (method && method != req.method) return false
    if (!pattern) return true
    const { pathname } = req
    if (typeof pattern == 'string') {
      return pathname == pattern
    } else if (pattern instanceof RegExp) {
      return pattern.test(pathname)
    }
  }
  //把request，response封装为context上下文
  _patch(req, res) {
    const { url, method, headers } = req
    const { pathname, query } = URL.parse(url, true)
    return {
      //原始对象和请求对象
      req, res, url, method, headers, pathname, query,
      //代理响应对象
      set(key, value) {
        this.res.setHeader(key, value)
      },
      get(key) {
        return this.res.getHeader(key)
      },
      set status(code) {
        this.res.statusCode = code
      },
      get status() {
        return this.res.statusCode
      },
      _body: undefined,
      get body() {
        return this._body
      },
      set body(value) { this._body = value }
      ,
      throw(status, message) {
        const error = new Error(message)
        error.status = status
        throw error
      },
    }
  }
  //处理函数
  handler(req, res) {
    const ctx = this._patch(req, res)
    let i = 0
    const next = () => {
      const rule = this.middlewares[i++];
      // 回溯完成
      if (!rule) return Promise.resolve()
      //路由匹配失败---》不执行该中间件
      if (!this._match(ctx, rule)) return next()
      try {
        return Promise.resolve(rule.fn(ctx, next))
      } catch (err) {
        return Promise.reject(err)
      }
    }
    //执行
    next().then(() => {
      if (typeof ctx.body == 'string') {
        res.end(ctx.body)
      } else if (Buffer.isBuffer(ctx.body)) {
        res.end(ctx.body.toString())
      } else {
        ctx.set('Content-type', 'application/josn')
        res.end(JSON.stringify(ctx.body))
      }
    }).catch(err => {
      console.log(err);
      ctx.status = 500
      ctx.message = err.message
    })
  }
  listen(port, callback) {
    this.server = http.createServer(this.handler.bind(this))
    this.server.listen(port, callback)
  }
}