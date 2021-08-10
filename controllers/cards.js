const Card = require('../models/card');

const ERROR_400 = 400;
const ERROR_404 = 404;
const ERROR_500 = 500;

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => res.status(ERROR_500).send({ message: 'Неожиданная ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_400).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(ERROR_500).send({ message: 'Неожиданная ошибка' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        res.status(ERROR_404).send({ message: 'Карточка с указанным ID не найдена' });
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_400).send({ message: 'Переданы некорректные данные при удалении карточки' });
      } else {
        res.status(ERROR_500).send({ message: 'Неожиданная ошибка' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(ERROR_404).send({ message: 'Карточка с указанным ID не найдена' });
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_400).send({ message: 'Переданы некорректные данные для постановки лайка' });
      } else {
        res.status(ERROR_500).send({ message: 'Неожиданная ошибка' });
      }
    });
};

module.exports.unlikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(ERROR_404).send({ message: 'Карточка с указанным ID не найдена' });
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_400).send({ message: 'Переданы некорректные данные для снятия лайка' });
      } else {
        res.status(ERROR_500).send({ message: 'Неожиданная ошибка' });
      }
    });
};
