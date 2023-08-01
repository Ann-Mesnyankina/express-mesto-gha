const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Поле "name" нужно заполнить'],
    minlength: [2, 'Минимальная длина поля - 2 '],
    maxlength: [30, 'Максимальная длина поля - 30'],
  },
  about: {
    type: String,
    required: [true, 'Поле "about" нужно заполнить'],
    minlength: [2, 'Минимальная длина поля - 2 '],
    maxlength: [30, 'Максимальная длина поля - 30'],
  },
  avatar: {
    type: String,
    required: [true, 'Поле "avatar" нужно заполнить'],
    validate: {
      validator(value) {
        return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(value);
      },
      message: 'Неверный URL',
    },
  },
}, { versionKey: false });

module.exports = mongoose.model('user', userSchema);
