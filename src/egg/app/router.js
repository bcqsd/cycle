module.exports = app => {
  const { router, controller } = app;

  router.get('/api/v1/user', controller.get_user);
  router.post('/api/v1/user', controller.post_user);
};