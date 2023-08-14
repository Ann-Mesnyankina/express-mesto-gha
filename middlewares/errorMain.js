module.exports.errorMain = (error, req, res, next) => {
  const { statusCode = error.status || 500, message } = error;
  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
  next();
};
