'use strict';

const { Application } = require('egg');

const app = new Application({
  baseDir: __dirname,
});

app.listen(3000, () => {
  console.log('Server running at http://127.0.0.1:3000/');
});