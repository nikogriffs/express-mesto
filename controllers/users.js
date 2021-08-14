const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Error } = require('mongoose');
const User = require('../models/user');
const UnauthorizedError = require('../errors/unauthorized-err');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');

// Закомментил некоторые участки кода,
// так как теперь за отлов ошибок в этих местах отвечает joi celebrate

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError('Пользователь с указанным ID не найден');
      }
      // throw new BadRequestError('Переданы некорректные данные при поиске пользователя');
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError('При регистрации указан email, который уже существует на сервере');
      }
      throw new BadRequestError('Переданы некорректные данные при создании пользователя');
    })
    .catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    // .orFail(new Error('NotFound'))
    .then((user) => {
      res.send(user);
    })
    // .catch((err) => {
    //   if (err.message === 'NotFound') {
    //     throw new NotFoundError('Пользователь с указанным ID не найден');
    //   }
    //   throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
    // })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    // .orFail(new Error('NotFound'))
    .then((user) => {
      res.send(user);
    })
    .catch(() => {
      // if (err.message === 'NotFound') {
      //   throw new NotFoundError('Пользователь с указанным ID не найден');
      // }
      throw new BadRequestError('Переданы некорректные данные при обновлении аватара');
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });

      res.cookie('jwt', token, { httpOnly: true, sameSite: true }).send({ token });
    })
    .catch(() => {
      throw new UnauthorizedError('Передан неверный логин или пароль');
    })
    .catch(next);
};
