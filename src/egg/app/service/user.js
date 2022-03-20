'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const { Service } = require('../../../super');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = class UserService extends Service {
  async query(name) {
    const ctx = this.ctx;

    const dataPath = path.join(__dirname, `../../../../data/${name}.json`);

    try {
      const data = await readFile(dataPath, 'utf8');

      return JSON.parse(data);
    } catch {
      ctx.throw('404', 'no user');
    }
  }

  async save(insert) {
    const ctx = this.ctx;

    // 数据校验
    if (!insert.name) {
      ctx.throw('422', 'name required');
    }

    const dataPath = path.join(__dirname, `../../../../data/${insert.name}.json`);

    try {
      await writeFile(dataPath, JSON.stringify(insert));
    } catch (err) {
      ctx.throw('500', err.message);
    }
  }
}