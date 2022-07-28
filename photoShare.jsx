import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid,
  Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from './components/loginRegister/LoginRegister';
import ActivityFeed from './components/activityFeed/ActivityFeed';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: '',
      name: '',
      isLoggedIn: false,
      user_id: '',
      user: '',
      uploaded: '',
    }
  }

  setInfo = (status, name) => {
    this.setState({status: status});
    this.setState({name: name});
  }

  setLogin = (isLoggedIn, user) => {
    this.setState({
      isLoggedIn: isLoggedIn,
      user: user
    });
  }

  setLogout = (isLoggedIn) => {
    this.setState({isLoggedIn: isLoggedIn, name: ''});
  }

  setUpload = (uploaded) => {
    this.setState({uploaded: uploaded});
  }

  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar params={this.state} onLogOut={this.setLogout} onUpload={this.setUpload}/>
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper className="cs142-main-grid-item">
            { this.state.isLoggedIn ?
              <UserList /> :
              ""
            }
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
              <Redirect exact path="/" to="/login-register" />
              { this.state.isLoggedIn ?
                <Route path="/users/:userId"
                render={ props => <UserDetail {...props} params={this.state} onNewInfo={this.setInfo} onDelete={this.setLogout} /> }
                /> :
                <Redirect path="/users/:id" to="/login-register"/>
              }
              { this.state.isLoggedIn ?
                <Route path="/photos/:userId"
                  render={ props => <UserPhotos {...props} params={this.state} onNewInfo={this.setInfo} /> }
                /> :
                <Redirect path="/photos/:id" to="/login-register"/>
              }
              { this.state.isLoggedIn ?
                <Route path="/users" component={UserList}  /> :
                <Redirect path="/users" to="/login-register" />
              }
              { this.state.isLoggedIn ?
                <Route path="/activity" component={ActivityFeed} /> :
                <Redirect path="/activity" to="/login-register" />
              }
              { this.state.isLoggedIn ?
                <Redirect path="/login-register" to={"/users/" + this.state.user['_id']} /> :
                <Route path="/login-register"
                  render={ props => <LoginRegister {...props} onLogIn={this.setLogin} /> }
                />
              }
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
    </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
