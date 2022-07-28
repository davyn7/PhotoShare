import React from 'react';
import {
  Button,
  Typography,
  Grid,
  TextField
} from '@material-ui/core';
import './LoginRegister.css';
import axios from 'axios';

/**
 *
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_name: '',
      password: '',
      login_name1: '',
      password1: '',
      first_name: '',
      last_name: '',
      description: '',
      occupation: '',
      location: '',
      isLoggedIn: false,
      user: undefined,
      success1: true,
      toggle: false,
      success2: true,
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleChange(event) {
    const name = event.target.name;
    this.setState({ [name]: event.target.value });
  }

  handleLogin(event) {
    var self = this;
    var res;
    axios.post("/admin/login", {
      login_name: this.state.login_name,
      password: this.state.password
    })
      .then((value) => {
        this.setState({isLoggedIn: true});
        this.setState({user: value['data']});
        res = value['data'];
        self.props.onLogIn(this.state.isLoggedIn, this.state.user);

        axios.post('/newActivity', {
          message: res['first_name'] + " " + res['last_name'] + " has logged in.",
          file_name: "",
          user_id: res['_id']
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
        this.setState({success1: false});
      });
    event.preventDefault();
  }

  handleRegister(event) {
    var res;
    axios.post("/user", {
      login_name: this.state.login_name1,
      password: this.state.password1,
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      description: this.state.description,
      occupation: this.state.occupation,
      location: this.state.location
    })
      .then((value) => {
        console.log(value);
        this.setState({isLoggedIn: true});
        res = value['data'];
        this.setState({user: value['data']});
        this.props.onLogIn(this.state.isLoggedIn, this.state.user);

        axios.post('/newActivity', {
          message: res['first_name'] + " " + res['last_name'] + " has registered.",
          file_name: "",
          user_id: res['_id']
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
        this.setState({success2: false});
      });

    event.preventDefault();
  }

  handleToggle(event) {
    if(this.state.toggle) {
      this.setState({toggle: false});
    } else {
      this.setState({toggle: true});
    }
    event.preventDefault();
  }

  render() {
    return (
      <div className="loginRegister">
        { !this.state.toggle ?
          <div>
            <Typography className="switchNow" variant="subtitle2">Don't have an account?</Typography>
            <Button variant="outlined" color="primary" size="small" onClick={this.handleToggle}>Click here to register!</Button>
            <br />
          </div> :
          <div>
            <Typography className="switchNow" variant="subtitle2">Have an account?</Typography>
            <Button variant="outlined" color="primary" size="small" onClick={this.handleToggle}>Click here to log in!</Button>
            <br />
          </div>
        }
        { !this.state.toggle ?
          <div>
            <br />
            <form className="form" noValidate onSubmit={this.handleLogin}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography className="logReg" component="h1" variant="h5">
                    Log in
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField variant="outlined" label="Login Name" name="login_name" value={this.state.login_name} onChange={this.handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField variant="outlined" label="Password" type="password" name="password" value={this.state.password} onChange={this.handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" className="submit">
                    Log In
                  </Button>
                </Grid>
              </Grid>
            </form>
            <br />
            { !this.state.success1 ?
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="secondary">The login name or password is incorrect!</Typography>
              </Grid> :
              ""
            }
          </div> :
          ""
        }
        { this.state.toggle ?
          <div>
            <br />
            <form className="form" noValidate onSubmit={this.handleRegister}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography className="logReg" component="h1" variant="h5">
                    Register
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField variant="outlined" label="First Name" name="first_name" value={this.state.first_name} onChange={this.handleChange} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField variant="outlined" label="Last Name" name="last_name" value={this.state.last_name} onChange={this.handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField variant="outlined" label="Login Name" name="login_name1" value={this.state.login_name1} onChange={this.handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField variant="outlined" label="Password" type="password" name="password1" value={this.state.password1} onChange={this.handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField variant="outlined" label="Description" name="description" value={this.state.description} onChange={this.handleChange} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField variant="outlined" label="Occupation" name="occupation" value={this.state.occupation} onChange={this.handleChange} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField variant="outlined" label="Location" name="location" value={this.state.location} onChange={this.handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" className="submit">
                    Register
                  </Button>
                </Grid>
              </Grid>
            </form>
            <br />
            { !this.state.success2 ?
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="secondary">Your first name, last name, login name, or password is missing or undefined!</Typography>
              </Grid> :
              ""
            }
          </div> :
          ""
        }
      </div>

    );
  }
}

export default LoginRegister;
