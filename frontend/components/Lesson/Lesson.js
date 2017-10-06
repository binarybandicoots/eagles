import React from 'react';
import LessonSlideListEntry from './LessonSlideListEntry.js';
import Slide from './Slide.js';
import { Button, Grid, Row, Image } from 'react-bootstrap';
import {Link} from 'react-router-dom';
import Test from './test.js';
import LessonPreview from './LessonPreview'

class Lesson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      specificLesson: {},
      slides: [],
      currentSlide: null,
      index: 0,
      videoIdOfClickedOnVideo: '',
      liked: false,
      keywords: [],
      firstLike: false,
      relatedLessons: [],
      preReq: [],
      preReqLessons: [],
      postedToClass: false
    }
  }

  getUsers() {
    return fetch('/users/', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    })
    .then((res) => res.json())
    .then((users) => {
      return users
    })
    .catch((err) => console.log('Error getting lessons', err));
  }

  componentWillReceiveProps(nextProps) {
    return nextProps.match.params.id !== this.props.match.params.id ? this.componentDidMount(nextProps.match.params.id) : null

    // return nextProps.match.params.id !== this.props.match.params.id ? true : false;
  }



  componentDidMount(id) {
    // console.log(this.props)
    id = id || this.props.match.params.id
    console.log('fetchingggg.g.......')
    fetch('/lesson/' + id, { method: 'GET', credentials: "include" })
      .then((response) => response.json())
      .then((lessonDataJSON) => {
        console.log('lessonDATAJSON', lessonDataJSON)
        this.setState({
          specificLesson: lessonDataJSON,
          slides: lessonDataJSON.slides,
          keywords: lessonDataJSON.keywords,
          preReq: lessonDataJSON.preReqLessons,
          preReqLessons: [],
          relatedLessons: []
        });
        console.log(this.state.specificLesson);
      })
      .then((res) => {
         fetch('/lessons', {
           method: "GET",
           headers: {
             "Content-Type": "application/json",
           },
           credentials: "include"
         })
         .then((res) => res.json())
         .then((lessons) => {
           this.state.keywords.forEach(keyword => {
             for (let i = 0; i < lessons.length; i++) {
               if (lessons[i].keywords.includes(keyword) && lessons[i]._id !== this.state.specificLesson._id && !this.state.relatedLessons.includes(lessons[i])) {
                 this.setState({
                   relatedLessons: [...this.state.relatedLessons, lessons[i]]
                 })
               }
             }
           })
           this.state.preReq.forEach(preReq => {
             for (let i = 0; i < lessons.length; i++) {
               if (lessons[i]._id === preReq) {
                 this.setState({
                   preReqLessons: [...this.state.preReqLessons, lessons[i]]
                 })
               }
             }
           })
           console.log('related lessons', this.state.relatedLessons)
         })
       })
  }

  onLessonSlideListEntryClick(index) {

    var videoIdInUrl = this.state.slides[index].youTubeUrl;
    var sliceFrom = videoIdInUrl.indexOf('=');
    var videoId = videoIdInUrl.slice(sliceFrom + 1);
    this.setState({
      currentSlide: this.state.slides[index],
      index: index,
      videoIdOfClickedOnVideo: videoId
    });
  }

  exit() {
    this.setState({
      currentSlide: '',
      index: ''
    });
  }

  previousSlideClick(index) {
    index--;
    if (index < 0) {
      this.exit();
    } else {
      this.setState({
        index: index
      });
      this.onLessonSlideListEntryClick(index);
    }
  }

  nextSlideClick(index) {
    index++;
    if (index === this.state.slides.length) {
      alert('You\'ve made it to the end of the lesson.')
      this.exit();
    } else {
      this.setState({
        index: index
      });
      this.onLessonSlideListEntryClick(index);
    }
  }

  renderVideo(thereIsAVideo) {
    if (thereIsAVideo) {
      return <iframe style={{width: 500, height: 350, float: "left"}} className="youtubeVideo" src={'https://www.youtube.com/embed/' + thereIsAVideo} allowFullScreen></iframe>
    }
  }

  likeALesson() {
    this.state.specificLesson.likes++;
    var body = { likes: this.state.specificLesson.likes, lessonId: this.state.specificLesson._id, fromLike: true };
    fetch('/lessons', {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
    .then(function(result) {
      return result.json();
    })
    .then((likeCheck) => {
      if (this.state.specificLesson.likes - 1 === likeCheck.likes) {
        this.state.specificLesson.likes = likeCheck.likes;
        this.setState({
          liked: true
        })
      } else {
        this.setState({
          firstLike: true
        })
        console.log(this.state.specificLesson);
      }
    })
    .catch(function(err) {
      console.log(err);
    })
  }

  postLessonToClassroom() {
    var lessonID = this.state.specificLesson._id

    var body = {
      title: this.state.specificLesson.name,
      description: this.state.specificLesson.description,
      link: `http://127.0.0.1:3000/lesson/${lessonID}`
    };

    fetch('/gclass/coursework', {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
    .then(results => {
      console.log('results', results)
      this.setState({
        postedToClass: true
      })
    })
    .catch(err => {console.log('error posting', err)})
  }

  render() {
    return (
      <div>
        { this.state.currentSlide ? (
          <Slide
          slideData={this.state.currentSlide}
          videoIdOfClickedOnVideo={this.state.videoIdOfClickedOnVideo}
          renderVideo={this.renderVideo(this.state.videoIdOfClickedOnVideo)}
          previousSlideClick={this.previousSlideClick.bind(this)}
          nextSlideClick={this.nextSlideClick.bind(this)}
          exitClick={this.exit.bind(this)}
          index={this.state.index}
          />
        ) : (
          <div className="lessonSlideList">
            <div className="lesson">
              <h1 className="lessonTitle" style={{color:'white'}}>{this.state.specificLesson.name}</h1>
              <p className="lessonDescription" style={{color:'white'}}>{this.state.specificLesson.description}</p>
              <p className="lessonKeyWords" style={{color:'white'}}> Keywords: {this.state.keywords.join(', ')}</p>
              <br></br>
              {
                this.props.sessionUserId === this.state.specificLesson.userRef ?
                <div>
                  <Link to={{
                    pathname: '/create',
                    lesson: this.state.specificLesson,
                    editingOldSlide: true
                  }}>
                    <Button type="button" bsStyle="primary" bsSize="small">Edit this Lesson</Button>
                  </Link>
                </div>
                : null
              }
              <Grid>
                <Row>
                {this.state.slides.map((slide, i) => (
                  <LessonSlideListEntry
                    slide={slide}
                    index={i}
                    key={i}
                    onLessonSlideListEntryClick={this.onLessonSlideListEntryClick.bind(this)}
                  />
                ))}
                </Row>
              </Grid>
            </div>
            <Button type="button" onClick={this.likeALesson.bind(this)}>
              <Image src="http://www.freeiconspng.com/uploads/like-button-png-2.png" width="15" height="15"/>
            </Button>
            {this.state.liked ? (
              <a> You liked this already! </a>
            ) : this.state.firstLike ? <a> You liked this! </a> : null}
            <div>
              <br></br>
              <a href='/login/google' target="_blank">LOG IN</a>
              {
                !this.state.postedToClass ? (
                  <Button type="button" onClick={this.postLessonToClassroom.bind(this)}>Post to gclass</Button>
                ) : (
                  <span className="posted-message">Posted to classroom!</span>
                )
              }

            </div>
          </div>
        )}
        <div className="relatedLessons" style={{color:'white'}}>
          Recommended Prerequisite Lessons:
          {this.state.preReqLessons.map((lesson, i) => (
            <LessonPreview
              lesson={lesson}
              index={i}
              key={i}
              getUsers={this.getUsers.bind(this)}
            />
          ))}
        </div>

        <div className="relatedLessons" style={{color:'white'}}>
          Related Lessons:
          {this.state.relatedLessons.map((lesson, i) => (
            <LessonPreview
              lesson={lesson}
              index={i}
              key={i}
              getUsers={this.getUsers.bind(this)}
            />
          ))}
        </div><br/>
      </div>
    );
  }
}


export default Lesson;
