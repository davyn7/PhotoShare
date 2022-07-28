import React from 'react';
import {
  Typography,
  Button
} from '@material-ui/core';
import './userDetail.css';
import axios from 'axios';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: '',
      first: '',
      name: '',
      loc: '',
      desc: '',
      job: '',
      status: 'userDetails',
      delete: false,
      curr_user_id: this.props.params['user']['_id'],
      isLoggedIn: true,
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  fetchModelNow = function() {
    axios.get(`/user/${this.props.match.params.userId}`)
      .then((value) => {
        this.setState({
          user_id: value['data']['_id'],
          first: value['data']['first_name'],
          name: value['data']['first_name'] + ' ' + value['data']['last_name'],
          loc: value['data']['location'],
          desc: value['data']['description'],
          job: value['data']['occupation'],
        });
        this.props.onNewInfo(this.state.status, this.state.name);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidUpdate(prevProps) {
    if(this.props.match.params.userId !== prevProps.match.params.userId) {
      this.fetchModelNow();
    }
  }

  componentDidMount() {
    this.fetchModelNow();
  }

  handleClick(event) {
    event.preventDefault();
    this.setState({delete: true});
  }

  handleDelete(event) {
    axios.post(`/deleteUser/${this.props.match.params.userId}`, {})
      .then((value) => {
        this.setState({isLoggedIn: false});
        this.props.onDelete(this.state.isLoggedIn);
        console.log(value);
      })
      .catch((error) => {
        console.log(error);
      });
    event.preventDefault();
  }

  handleCancel(event) {
    event.preventDefault();
    this.setState({delete: false});
  }

  render() {
    return (
      <div className="userDetail">
        <Typography className="userName" variant="h6">
          {this.state.name}
        </Typography>
        <Typography className="userJob" variant="subtitle2">
          {this.state.job}
        </Typography>
        <Typography className="userDesc" variant="body2">
          {this.state.desc}
        </Typography>
        <Typography className="userLoc" variant="subtitle1">
          {this.state.loc}
        </Typography>
        <Button className="userBtn" variant="contained" color="secondary" href={"#/photos/" + this.state.user_id}>
          View {this.state.first}'s Photos
        </Button>
        <br />
        <br />
        {this.state.curr_user_id === this.props.match.params.userId ?
          <Button onClick={this.handleClick}>Delete My Account</Button> :
          ""
        }
        <br />
        {this.state.delete ?
          <div>
            <Typography className="warning" variant="overline" display="block" color="secondary">Are you sure you want to delete your account?</Typography>
            <Button onClick={this.handleDelete}>Delete</Button>
            <Button onClick={this.handleCancel}>Cancel</Button>
          </div> :
          ""
        }
      </div>
    );
  }
}

export default UserDetail;
