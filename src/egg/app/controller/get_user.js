'use strict';

module.exports = async ctx => {
  const data = await ctx.service.user.query(ctx.query.name);
  
  ctx.status = 200;
  ctx.body = {
    success: true,
    data,
  };
}
