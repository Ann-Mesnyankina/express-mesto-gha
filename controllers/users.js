const mongoose = require('mongoose');
const User = require('../models/user');
const {
  badRequest, notFound, internalServerError, okStatus,
} = require('../utils/constants');

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(internalServerError).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.getUserId = (req, res) => {
  User.findByIdAndUpdate(req.params.userId)
    .orFail()
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        res.status(badRequest).send({ message: 'Передан неверный ID' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(notFound).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res.status(internalServerError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(okStatus).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(badRequest).send({ message: error.message });
      } else {
        res.status(internalServerError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.updateProfile = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { name: req.body.name, about: req.body.about }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(badRequest).send({ message: 'Передан неверный ID' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(notFound).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res.status(internalServerError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.updateAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        res.status(badRequest).send({ message: 'Передан неверный ID' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(notFound).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res.status(internalServerError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};
