const jwt = require('jsonwebtoken');
const AuthError = require('../errors/auth-err');
const InternalServerError = require('../errors/internal-server-err');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthError('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'mesto-secret-key');
  } catch (err) {
    return next(new AuthError('Необходима авторизация'));
  }
  req.user = payload;
  return next(new InternalServerError('На сервере произошла ошибка'));
};
