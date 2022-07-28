import React from 'react';
import {
  Typography,
  Button,
  Divider,
  Grid,
  TextField,
  IconButton
} from '@material-ui/core';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import './userPhotos.css';
import axios from 'axios';


/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: this.props.match.params.userId,
      name: '',
      photos: '',
      status: 'userPhotos',
      comment: [],
      uploaded: false,
      curr_user_id: this.props.params['user']['_id'],
      curr_user: this.props.params['user'],
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit= this.handleSubmit.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleUnlike = this.handleUnlike.bind(this);
  }

  fetchModelNow = () => {
    axios.get(`/photosOfUser/${this.props.match.params.userId}`)
      .then((value) => {
        console.log(value['data']);
        this.setState({photos: value['data']});
      })
      .catch((error) => {
        console.log(error);
      });
    axios.get(`/user/${this.props.match.params.userId}`)
      .then((value) => {
        this.setState({name: value['data']['first_name'] + " " + value['data']['last_name']});
        this.props.onNewInfo(this.state.status, this.state.name);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getPhotosList = () => {
    axios.get(`/photosOfUser/${this.props.match.params.userId}`)
      .then((value) => {
        console.log(value['data']);
        this.setState({photos: value['data']});
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidMount() {
    this.fetchModelNow();
    let len = this.state.photos.length;
    this.append(len);
  }

  componentDidUpdate(prevProps) {
    if(this.props.match.params.userId !== prevProps.match.params.userId) {
      this.fetchModelNow();
    }
    if(this.state.uploaded !== this.props.params['uploaded']) {
      this.getPhotosList();
      this.setState({uploaded: this.props.params['uploaded']});
    }
  }

  getDate(date) {
    let months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    let d = date.substring(8, 10);
    let m = date.substring(5, 7);
    let mo = months[parseInt(m, 10) - 1];
    let y = date.substring(0, 4);
    let retval = mo + " " + d + ", " + y;
    return retval;
  }

  append(len) {
    for(let i = 0; i < len; i++) {
      let curr = this.state.comment;
      curr.push("");
      this.setState({
        comment: curr,
      });
    }
  }

  handleChange(event) {
    let i = parseInt(event.target.name);
    let curr = this.state.comment;
    curr[i] = event.target.value;
    this.setState({comment: curr});
  }

  handleSubmit(event) {
    let i = parseInt(event.target.name);
    let comment = this.state.comment[i];

    axios.post(`/commentsOfPhoto/${this.state.photos[i]._id}`, {
      comment: comment
    })
      .then((value) => {
        console.log(value);
        this.getPhotosList();
        let len = this.state.photos.length;
        this.append(len);

        axios.post('/newActivity', {
          message: this.props.params['user']['first_name'] + " " + this.props.params['user']['last_name'] + " has uploaded a new comment on " + this.state.name + "'s photo.",
          file_name: this.state.photos[i]['file_name'],
          user_id: this.props.params['user']['_id']
        })
          .then((value) => {
            console.log(value);
          })
          .catch((error) => {
            console.log(error);
          });

      })
      .catch((error) => {
        console.log(error);
      });

    event.preventDefault();
  }

  handleLike(i, event) {
    axios.post(`/likePhoto/${this.state.photos[i]._id}`, {
      like: true
    })
      .then((value) => {
        console.log(value);
        let curr = this.state.photos;
        curr[i]['likes'].push(this.state.curr_user_id);
        this.setState({photos: curr});
      })
      .catch((error) => {
        console.log(error);
      });
    event.preventDefault();
  }

  handleUnlike(i, event) {
    axios.post(`/likePhoto/${this.state.photos[i]._id}`, {
      like: false
    })
      .then((value) => {
        console.log(value);
        let curr = this.state.photos;
        var index = curr[i]['likes'].indexOf(this.state.curr_user_id);
        curr[i]['likes'].splice(index, 1);
        this.setState({photos: curr});
      })
      .catch((error) => {
        console.log(error);
      });
    event.preventDefault();
  }

  handleDeleteComment(body, event) {
    console.log(body);
    axios.post(`/deleteComment/${this.state.photos[body[0]]._id}`, {
      commentId: body[2],
      commentUserId: body[1]
    })
      .then((value) => {
        console.log(value);
        this.getPhotosList();
      })
      .catch((error) => {
        console.log(error);
      });
    event.preventDefault();
  }

  handleDeletePhoto(photo_id, event) {
    axios.post(`/deletePhoto/${photo_id}`, {})
      .then((value) => {
        console.log(value);
        this.getPhotosList();
      })
      .catch((error) => {
        console.log(error);
      });
    event.preventDefault();
  }

  render() {
    let userPhotos = this.state.photos;
    let photos = [];
    let commentList;
    let photoList;
    for(let i = 0; i < userPhotos.length; i++) {
      let comments = [];
      let currComment = userPhotos[i].comments;
      let photoFile = userPhotos[i].file_name;
      let photoDate = userPhotos[i].date_time;
      let numLikes = userPhotos[i].likes.length;
      if(currComment !== undefined) {
        for(let j = 0; j < currComment.length; j++) {
          let commentUser = currComment[j].user;
          let commentName = commentUser.first_name;
          let commentUserId = commentUser._id;
          let commentDate = currComment[j].date_time;
          let commentText = currComment[j].comment;
          let body = [];
          body.push(i);
          body.push(commentUserId);
          body.push(currComment[j]._id);
          comments.push(
            <div className="commentObj">
              <div className="commentBar">
                <a className="commentLink" href={"#/users/" + commentUserId}>
                  <Typography className="commentName" button color="secondary" variant="subtitle1">
                    {commentName}
                  </Typography>
                </a>
                <Typography className="commentText" variant="subtitle1">
                  {commentText}
                  {this.state.curr_user_id === commentUserId ?
                    <IconButton className="deleteComment" onClick={this.handleDeleteComment.bind(this, body)}><HighlightOffIcon /></IconButton>  :
                    ""
                  }
                </Typography>
              </div>
              <Typography className="commentDate" variant="caption">
                {this.getDate(commentDate)}
              </Typography>
            </div>
          );
        }
      }
      commentList = comments.map((value, index) =>
        <p key={index}>{value}</p>
      );
      photos.push(
        <div className="photoObj">
          <img className="photo" src={"images/" + photoFile}/>
          <Typography className="photoDate" variant="subtitle2">
            {"Uploaded on " + this.getDate(photoDate)}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={1}>
              {!this.state.photos[i]['likes'].includes(this.state.curr_user_id) ?
                <IconButton onClick={this.handleLike.bind(this, i)}><FavoriteBorderIcon color="secondary"/></IconButton> :
                <IconButton onClick={this.handleUnlike.bind(this, i)}><FavoriteIcon color="secondary"/></IconButton>
              }
            </Grid>
            <Grid item xs={12} sm={1}>
              {this.state.curr_user_id === this.state.user_id ?
                <IconButton onClick={this.handleDeletePhoto.bind(this, userPhotos[i]['_id'])}><DeleteForeverIcon color="primary"/></IconButton> :
                ""
              }
            </Grid>
          </Grid>
          {numLikes === 1 ?
            <Typography variant="caption" display="block">{numLikes + " like"}</Typography> :
            <Typography variant="caption" display="block">{numLikes + " likes"}</Typography>
          }
          {commentList}
          <form className="commentForm" noValidate name={i} onSubmit={this.handleSubmit} >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={2}>
                <TextField variant="standard" label="Comment" name={i} value={this.state.comment[i]} onChange={this.handleChange} />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button type="submit" variant="contained" color="primary" className="submit">Submit</Button>
              </Grid>
            </Grid>
          </form>
          <br />
          <Divider />
        </div>
      );
    }
    photoList = photos.map((value1, index1) =>
      <span key={index1}>{value1}</span>
    );

    return (
      <div className="userPhotos">
        <Typography variant="h4">{'Photos of ' + this.state.name}</Typography>
        {photoList}
      </div>
    );
  }
}

export default UserPhotos;
