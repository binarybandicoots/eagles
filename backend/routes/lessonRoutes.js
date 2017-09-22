const express = require('express');
const schema = require('../db/schema.js');
const router = express.Router();
const mongoose = require('mongoose');
var User = schema.User;
var Lesson = schema.Lesson;
var Slide = schema.Slide;

//find specific lesson
router.get('/lesson/:lessonId', function(req, res) {
  Lesson.find({_id: req.params.lessonId})
  .then(function(lesson) {    
    return lesson[0];
  })
  .then((specificLesson) => {
    Slide.find({})
    .then((allSlides) => {
      specificLesson.slides = allSlides.filter((slide) => {
        if (specificLesson.slides.indexOf(slide._id) >= 0) {
          return slide;
        }
      });
      return specificLesson;
    })
    .then((lessonWithSlides) => {
      res.send(lessonWithSlides);
    })
  })
  .catch(function(err) {
    res.send(err);
  })
});

//find all lessons
router.get('/lessons', function(req, res) {
  Lesson.find({})
  .then(function(lessons) {
    res.send(lessons);
  })
  .catch(function(err) {
    res.send(err);
  })
});

router.post('/lessons', function(req, res) {
  var name = req.body.name;
  var userRef = req.body.userRef
  var description = req.body.description;
  var keywords = req.body.keywords;
  var slides = req.body.slides || [];
  Lesson.create({ 
    name: name, 
    userRef: userRef, 
    description: description, 
    keywords: keywords,
    slides: slides ,
    likes: 0,
    userLikes: []
  })
  .then(function(result) {
    User.findById(userRef, function(err, user) {
      //console.log('err',err,'user',user);
      if (err) {
        throw err;
        return;
      } else {
        user.lessons.push(result._id);
        user.save();
      }
    })
    return result;
  })
  .then(result => {
    res.send(result);
  })
  .catch(function(err) {
    res.send('Error at endpoint /lessons type POST: ', err);
  })
})

router.put('/lessons', function(req, res) {
  console.log('hello line239 router.js req is ', req.body);
  Lesson.findById(req.body.lessonid, function(err, lesson) {
    //console.log('lesson is ', lesson, 'err is ', err)
    // console.log('Lesson is ', Lesson, lesson.keyWords)
    if (err) res.send(err);

    if (req.body.name) lesson.name = req.body.name;
    if (req.body.userRef) lesson.userRef = req.body.userRef;
    if (req.body.description) lesson.description = req.body.description;
    if (req.body.slides) lesson.slides = req.body.slides;
    if (req.body.keyWords) lesson.keyWords = req.body.keyWords;
    if (req.body.fromLike) { // Therefore likes will not be added on put requests not from lesson.js
      if (lesson.userLikes.length !== 0) {
        if (lesson.userLikes.indexOf(req.session.username) === -1) {
          lesson.userLikes.push(req.session.username);
           if (req.body.likes) lesson.likes = req.body.likes; // If they've liked it, good.
        }
      } else {
        lesson.userLikes.push(req.session.username);
         if (req.body.likes) lesson.likes = req.body.likes
      }
    }

    // console.log('lesson.keyWords',lesson.keyWords, req.body.keyWords)
    lesson.save()
    .then(function (result) {
      console.log('RES', result);

      res.send(result);
    })
    .catch(function(err) {
      console.log('line 271', err);
      throw err;
      return;
    })
  })
})

router.delete('/lessons/:lessonId', function(req, res) {
  Lesson.findByIdAndRemove(req.params.lessonId, function(err, lesson) {
    if (err) {
      throw err;
      return;
    };

    res.send(lesson);
  });
});

module.exports = router;