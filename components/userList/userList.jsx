import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography
}
from '@material-ui/core';
import './userList.css';
import axios from 'axios';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: '',
    }
  }

  componentDidMount() {
    axios.get(`http://localhost:3000/user/list`)
      .then((value) => {
        this.setState({userList: value['data']});
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    let userList = this.state.userList;
    let user_list = [];
    let user_id_list = [];
    for(let i = 0; i < userList.length; i++) {
      user_list.push(userList[i].first_name);
      user_id_list.push(userList[i]._id);
    }
    return (
      <div>
        <Typography variant="h4">
          Our User List!
        </Typography>
        <List component="nav">
          {user_list.map((value, index) => {
            return (
              <div>
              <a className="userNameUL" href={'#/users/' + user_id_list[index]}>
                <ListItem button divider key={value}>
                  <ListItemText primary={value} />
                </ListItem>
              </a>
              <Divider />
              </div>
            );
          })}
        </List>
      </div>
    );
  }
}

export default UserList;
