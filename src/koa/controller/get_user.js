'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);

module.exports = async ctx => {
  const name = ctx.query.name;
  const dataPath = path.join(__dirname, `../../data/${name}.json`);

  try {
    const data = await readFile(dataPath, 'utf8');
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: JSON.parse(data),
    }
  } catch (err) {
    ctx.throw('404', 'no user');
  }
}
