const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const CastError = require('../errors/cast-err');
const ConflictStatus = require('../errors/conflict-err');

module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((error) => {
      next(error);
    });
};

module.exports.getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new CastError('Передан неверный ID'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(error);
      }
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(error);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      res.send({
        _id: user._id,
        email: user.email,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
      });
    })
    .catch((error) => {
      if (error.code === 11000) {
        next(new ConflictStatus('Этот email уже зарегестрирован'));
      } else if (error instanceof mongoose.Error.ValidationError) {
        next(new CastError('Переданы неверные данные'));
      } else {
        next(error);
      }
    });
};

module.exports.updateProfile = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { name: req.body.name, about: req.body.about }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new CastError('Передан неверный ID'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(error);
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new CastError('Передан неверный ID'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(error);
      }
    });
};

module.exports.login = (req, res, next) => {
  User.findUserByCredentials(req.body.email, req.body.password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'mesto-secret-key', { expiresIn: '7d' });
      return res.send({ token });
    })
    .catch((error) => next(error));
};
