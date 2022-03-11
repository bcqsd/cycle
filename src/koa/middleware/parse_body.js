'use strict';

const promiseReq = req => {
  return new Promise((resolve, reject) => {
    const buffer = [];

    req.on('data', chunk => {
      buffer.push(chunk);
    });
  
    req.on('end', () => {
      // 解析 Body，存到 `req.body` 供后续中间件使用
      const body = JSON.parse(Buffer.concat(buffer).toString());
      resolve(body);
    });

    req.on('error', err => {
      reject(err);
    })
  })
}

module.exports = async (ctx, next) => {
  if (ctx.req.method !== 'POST' && ctx.req.method !== 'PUT') {
    return await next();
  }

  const requestBody = await promiseReq(ctx.req);

  ctx.requestBody = requestBody;

  await next();
};
