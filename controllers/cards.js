const mongoose = require('mongoose');
const Card = require('../models/card');

module.exports.getAllCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((card) => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail()
    .then(() => {
      res.send({ message: 'Карта удалена' });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        res.status(400).send({ message: 'Передан неверный ID' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(404).send({ message: 'Карта по ID не найдена' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.createCard = (req, res) => {
  Card.create({ name: req.body.name, link: req.body.link, owner: req.user._id })
    .then((card) => res.status(201).send(card))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({ message: error.message });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.updateLike = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((card) => {
      res.send({ data: card });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        res.status(400).send({ message: 'Передан неверный ID' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(404).send({ message: 'Карта по ID не найдена' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.deleteLike = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((card) => {
      res.send({ data: card });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        res.status(400).send({ message: 'Передан неверный ID' });
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(404).send({ message: 'Карта по ID не найдена' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};
