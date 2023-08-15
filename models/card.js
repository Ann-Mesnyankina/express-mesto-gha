const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Поле "name" нужно заполнить'],
    minlength: [2, 'Минимальная длина поля - 2 '],
    maxlength: [30, 'Максимальная длина поля - 30'],
  },
  link: {
    type: String,
    required: [true, 'Поле "link" нужно заполнить'],
    validate: {
      validator(value) {
        return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(value);
      },
      message: 'Неверный URL',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Поле "owner" нужно заполнить'],
    ref: 'user',
  },
  likes: [
    {
      default: [],
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

module.exports = mongoose.model('card', cardSchema);
