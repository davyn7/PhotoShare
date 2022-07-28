import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid
} from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: '',
      isLoggedIn: '',
      uploaded: false,
    }
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    axios.get("/test/info")
      .then((value) => {
        console.log(value);
        this.setState({version: value['data']['__v']});
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleClick(event) {
    axios.post('/admin/logout', {})
      .then((value) => {
        this.setState({isLoggedIn: false});
        this.props.onLogOut(this.state.isLoggedIn);

        return axios.post('/newActivity', {
          message: this.props.params['user']['first_name'] + " " + this.props.params['user']['last_name'] + " has logged out.",
          file_name: "",
          user_id: value['data']
        });

      })
      .catch((error) => {
        console.log(error);
      });

    event.preventDefault();
  }

  //this function is called when user presses the update button
  handleUploadButtonClicked = (e) => {
    if(this.state.uploaded) {
      this.setState({uploaded: false});
    } else {
      this.setState({uploaded: true});
    }
    this.props.onUpload(this.state.uploaded);
    e.preventDefault();

    let photo;

    if (this.uploadInput.files.length > 0) {

    // Create a DOM form and add the file to it under the name uploadedphoto
    const domForm = new FormData();
    domForm.append('uploadedphoto', this.uploadInput.files[0]);
    axios.post('/photos/new', domForm)
      .then((res) => {
        photo = res;
        console.log(res);
        axios.post('/newActivity', {
          message: this.props.params['user']['first_name'] + " " + this.props.params['user']['last_name'] + " has uploaded a new photo.",
          file_name: photo['data']['file_name'],
          user_id: this.props.params['user']['_id']
        })
          .then((value) => {
            console.log(value);
          })
          .catch((error) => {
            console.log(error);
          });

      })
      .catch(err => console.log(`POST ERR: ${err}`));
    }
  }

  render() {
    let name = this.props.params['name'];
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          { this.props.params['isLoggedIn'] === true ?
            <div className="topBar">

              <Grid container spacing={1}>
                <Grid item xs={12} sm={2}>
                  <Typography className="leftElem" variant="h5" color="inherit" align='center'>
                      {"Hi " + this.props.params['user']['first_name'] + "!"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <input className="inputElem" type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button className="uploadElem" variant="contained" color="primary" onClick={this.handleUploadButtonClicked}>Upload</Button>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button className="activityElem" variant="contained" color="primary" href={"#/activity"}>Activity</Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                  { this.props.params['status'] === "userPhotos" ?
                  <Typography className="rightElem" variant="h5" color="inherit" align='center'>
                      {'Photos of ' + name}
                  </Typography> :
                  <Typography className="rightElem" variant="h5" color="inherit" align='center'>
                      {name}
                  </Typography>
                  }
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button className="logoutElem" variant="contained" color="secondary" onClick={this.handleClick} endIcon={<ExitToAppIcon />}>Log Out</Button>
                </Grid>
              </Grid>



            </div>
             :
           <Typography className="leftElem" variant="h5" color="inherit" align='center'>
               Welcome to your photo share app!
           </Typography>
          }
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
