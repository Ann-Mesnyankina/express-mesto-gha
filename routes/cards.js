const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getAllCards, deleteCardById, createCard, updateLike, deleteLike,
} = require('../controllers/cards');

router.get('/', getAllCards);
router.delete('/:cardId', deleteCardById);
router.post('/', createCard);
router.put('/:cardId/likes', updateLike);
router.delete('/:cardId/likes', deleteLike);

module.exports = router;
