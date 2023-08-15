const mongoose = require('mongoose');
const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const CastError = require('../errors/cast-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports.getAllCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((card) => res.send({ data: card }))
    .catch((error) => next(error));
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail()
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Не получится удалить чужую карту');
      }
      Card.deleteMany(card)
        .then(() => {
          res.send({ message: 'Карта удалена' });
        })
        .catch((error) => {
          if (error instanceof mongoose.Error.CastError) {
            next(new CastError('Передан неверный ID'));
          } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
            next(new NotFoundError('Карта по ID не найдена'));
          } else if (error.name === 'TypeError') {
            next(new CastError('Передан несуществующий в БД ID карты'));
          } else {
            next(error);
          }
        });
    });
};

module.exports.createCard = (req, res, next) => {
  Card.create({ name: req.body.name, link: req.body.link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new CastError('Переданы неверные данные'));
      } else {
        next(error);
      }
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
        next(new CastError('Передан неверный ID'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Карта по ID не найдена'));
      } else {
        next(error);
      }
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
        next(new CastError('Передан неверный ID'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Карта по ID не найдена'));
      } else {
        next(error);
      }
    });
};
