import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Divider
} from '@material-ui/core';
import './ActivityFeed.css';
import axios from 'axios';

/**
 * Define ActivityFeed, a React componment of CS142 project #8
 */
class ActivityFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: '',
    }
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  getActivityList = () => {
    axios.get("/activity")
      .then((value) => {
        this.setState({activities: value['data']});
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidMount() {
    this.getActivityList();
  }

  handleRefresh(event) {
    this.getActivityList();
    event.preventDefault();
  }

  getDate(date) {
    let months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    let d = date.substring(8, 10);
    let m = date.substring(5, 7);
    let mo = months[parseInt(m, 10) - 1];
    let y = date.substring(0, 4);
    let t = date.substring(11, 19);
    let retval = mo + " " + d + ", " + y + " at " + t;
    return retval;
  }

  render() {
    let activities = this.state.activities;
    let messages = [];
    let photos = [];
    let date = [];
    for(let i = 0; i < activities.length; i++) {
      messages.push(activities[i].message);
      photos.push(activities[i].file_name);
      date.push(this.getDate(activities[i].date_time.toString()));
    }
    return (
      <div className="activity">
        <Typography variant="h4">Activity Feed</Typography>
        <br />
        <Button variant="outlined" color="secondary" onClick={this.handleRefresh}>Refresh</Button>
        <List component="nav">
          {messages.map((value, index) => {
            return (
              <div>
                <ListItem divider key={value}>
                  <ListItemText primary={value} secondary={"Done on " + date[index]} />
                  { photos[index] !== "" ?
                    <img className="photo1" src={"images/" + photos[index]} /> :
                    ""
                  }
                </ListItem>
                <Divider />
              </div>
            );
          })}
        </List>
      </div>
    );
  }
}

export default ActivityFeed;
