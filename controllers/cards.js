const { Error } = require('mongoose');
const Card = require('../models/card');
const ForbiddenError = require('../errors/forbidden-err');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');

// Закомментил некоторые участки кода,
// так как теперь за отлов ошибок в этих местах отвечает joi celebrate

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch(() => {
      throw new BadRequestError('Переданы некорректные данные при создании карточки');
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (JSON.stringify(req.user._id) === JSON.stringify(card.owner)) {
        Card.findByIdAndDelete(req.params.cardId)
          .then((result) => {
            res.send(result);
          });
      } else {
        throw new ForbiddenError('Попытка удалить чужую карточку');
      }
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError('Карточка с указанным ID не найдена');
      }
      // else if (err.name === 'CastError') {
      //   throw new BadRequestError('Переданы некорректные данные при удалении');
      // }
      return next(err);
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotFound'))
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError('Карточка с указанным ID не найдена');
      }
      // throw new BadRequestError('Переданы некорректные данные для постановки лайка');
    })
    .catch(next);
};

module.exports.unlikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotFound'))
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError('Карточка с указанным ID не найдена');
      }
      // throw new BadRequestError('Переданы некорректные данные для снятия лайка');
    })
    .catch(next);
};
