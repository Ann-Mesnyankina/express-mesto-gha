const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const CastError = require('../errors/cast-err');
const InternalServerError = require('../errors/internal-server-err');
const ConflictStatus = require('../errors/conflict-err');
const AuthError = require('../errors/auth-err');

module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => {
      next(new InternalServerError('На сервере произошла ошибка'));
    });
};

module.exports.getUserId = (req, res, next) => {
  User.findByIdAndUpdate(req.params.userId)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Передан несуществующий ID');
      }
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        return next(new CastError('Передан неверный ID'));
      } if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Запрашиваемый пользователь не найден'));
      }
      return next(new InternalServerError('На сервере произошла ошибка'));
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Передан несуществующий ID');
      }
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        return next(new CastError('Передан неверный ID'));
      } if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Запрашиваемый пользователь не найден'));
      }
      return next(new InternalServerError('На сервере произошла ошибка'));
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 8)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.send({
      _id: user._id,
      email: user.email,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    }))
    .catch((error) => {
      if (error.code === 11000) {
        return next(new ConflictStatus('Этот email уже зарегестрирован'));
      }
      if (error.name === 'ValidationError') {
        return next(new CastError('Переданы неверные данные'));
      }
      return next(new CastError('На сервере произошла ошибка'));
    });
};

module.exports.updateProfile = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { name: req.body.name, about: req.body.about }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        return next(new CastError('Передан неверный ID'));
      } if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } return next(new InternalServerError('На сервере произошла ошибка'));
    });
};

module.exports.updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        return next(new CastError('Передан неверный ID'));
      } if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } return next(new InternalServerError('На сервере произошла ошибка'));
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthError('Неправильные почта или пароль');
      }
      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthError('Неправильные почта или пароль');
          }
          const token = jwt.sign({ _id: user._id }, 'mesto-secret-key', { expiresIn: '7d' });
          return res.send({ token });
        })
        .catch(next);
    });
};
