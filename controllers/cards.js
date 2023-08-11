const mongoose = require('mongoose');
const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const CastError = require('../errors/cast-err');
const InternalServerError = require('../errors/internal-server-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports.getAllCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((card) => res.send({ data: card }))
    .catch(() => next(new InternalServerError('На сервере произошла ошибка')));
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail()
    .then((user) => {
      if (!user.owner.equals(req.user._id)) {
        throw new ForbiddenError('Не получится удалить чужую карту');
      }
      res.send({ message: 'Карта удалена' });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        return next(new CastError('Передан неверный ID'));
      } if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Карта по ID не найдена'));
      } return next(new InternalServerError('На сервере произошла ошибка'));
    });
};

module.exports.createCard = (req, res, next) => {
  Card.create({ name: req.body.name, link: req.body.link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new CastError('Переданы неверные данные'));
      } return next(new InternalServerError('На сервере произошла ошибка'));
    });
};

module.exports.updateLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((card) => {
      res.send({ data: card });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        return next(new CastError('Передан неверный ID'));
      } if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Карта по ID не найдена'));
      } return next(new InternalServerError('На сервере произошла ошибка'));
    });
};

module.exports.deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((card) => {
      res.send({ data: card });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        return next(new CastError('Передан неверный ID'));
      } if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Карта по ID не найдена'));
      } return next(new InternalServerError('На сервере произошла ошибка'));
    });
};
