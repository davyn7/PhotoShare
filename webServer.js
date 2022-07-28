"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var Activity = require('./schema/activity.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require("fs");

var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

// var makePasswordEntry = require('./cs142password.js').makePasswordEntry;
// var doesPasswordMatch = require('./cs142password.js').doesPasswordMatch;

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
  if(request.session === null || request.session == undefined || request.session.user === null || request.session.user === undefined) {
      response.status(401).send("User is not logged in.");
  } else {
    var userList = [];
    User.find({}).select('first_name last_name').exec(function(error, value) {
      if(error) {
        response.status(400).send('Exec error');
        console.log(error);
        return;
      } else {
        var currUserList = JSON.parse(JSON.stringify(value));
        currUserList.forEach((item, i) => {
          console.log(i);
          var currUser = {};
          currUser['_id'] = item['_id'];
          currUser['first_name'] = item['first_name'];
          currUser['last_name'] = item['last_name'];
          userList.push(currUser);
        });
        response.status(200).send(userList);
      }
    });
  }
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
  if(request.session === null || request.session == undefined || request.session.user === null || request.session.user === undefined) {
      response.status(401).send("User is not logged in.");
  } else {
    var id = request.params.id;
    var user = {};
    User.findOne({_id: id}).exec(function(error, value) {
      if(error) {
        response.status(400).send('Exec error');
        console.log(error);
        return;
      } else if(value === null) {
        console.log('User with _id:' + id + ' not found.');
        response.status(400).send('Not found');
        return;
      } else {
        var currUser = JSON.parse(JSON.stringify(value));
        user['_id'] = currUser['_id'];
        user['first_name'] = currUser['first_name'];
        user['last_name'] = currUser['last_name'];
        user['location'] = currUser['location'];
        user['description'] = currUser['description'];
        user['occupation'] = currUser['occupation'];
        response.status(200).send(user);
      }
    });
  }
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
  if(request.session === null || request.session == undefined || request.session.user === null || request.session.user === undefined) {
      response.status(401).send("User is not logged in.");
  } else {
    var id = request.params.id;
    var photos = [];
    var toAsync = [];
    Photo.find({'user_id': id}).exec(function (error, value) {
      if(error) {
        response.status(400).send('Exec error');
        console.log(error);
        return;
      } else if(value === undefined) {
        console.log('Photos for user with _id: ' + id + ' not found.');
        response.status(400).send('Not found');
        return;
      } else {
        value.sort(function(a, b) {
          return (b['likes'].length - a['likes'].length);
        });
        var currPhotos = JSON.parse(JSON.stringify(value));
        currPhotos.forEach((item, i) => {
          console.log(i);
          var photo = {};
          photo['_id'] = item['_id'];
          photo['file_name'] = item['file_name'];
          photo['date_time'] = item['date_time'];
          photo['user_id'] = item['user_id'];
          photo['comments'] = [];
          photo['likes'] = item['likes'];
          item['comments'].forEach((item1, j) => {
            console.log(j);
            var comment = {};
            var commentUser = function(callback) {
              User.findOne({_id: item1['user_id']}).exec(function(error, value1) {
                if(error) {
                  console.log(error);
                  response.status(400).send('Exec error');
                } else if(value1 === null) {
                  console.log('User with _id:' + id + ' not found.');
                  response.status(400).send('Not found');
                } else {
                  var currCommenter = JSON.parse(JSON.stringify(value1));
                  var commenter = {};
                  commenter['_id'] = currCommenter['_id'];
                  commenter['first_name'] = currCommenter['first_name'];
                  commenter['last_name'] = currCommenter['last_name'];
                  comment['user'] = commenter;
                }
                callback();
              });
            }
            toAsync.push(commentUser);
            comment['_id'] = item1['_id'];
            comment['date_time'] = item1['date_time'];
            comment['comment'] = item1['comment'];
            photo['comments'].push(comment);
          });
          photos.push(photo);
        });
      }
      async.parallel(toAsync, function() {
        response.status(200).send(photos);
      });
    });
  }
});

app.post('/admin/login', function (request, response) {
  var login_name = request.body.login_name;
  var password = request.body.password;
  User.findOne({login_name: login_name}).exec(function(error, value) {
    if(error) {
      console.log(error);
      response.status(400).send('Exec error');
    } else if(value === null) {
      console.log('User with login name:' + login_name + ' not found.');
      response.status(400).send('Not found');
      // else if(doesPasswordMatch(value['hash'], value['salt'], password));
    } else if(password !== value['password'] ) {
      console.log('The password ' + password + ' is incorrect');
      response.status(400).send('Password is incorrect');
    } else {
      request.session.user = value;
      request.session.user_id = value['_id'];
      response.status(200).send(value);
    }
  });
});

app.post('/user', function (request, response) {
  var login_name = request.body.login_name;
  var password = request.body.password;
  var first_name = request.body.first_name;
  var last_name = request.body.last_name;
  var location = request.body.location;
  var occupation = request.body.occupation;
  var description = request.body.description;
  // var obj = makePasswordEntry(password);
  if(first_name === "" || first_name === undefined) {
    console.log('Login name undefined');
    response.status(400).send('Login name undefined');
    return;
  }
  if(password === "" || password === undefined) {
    console.log('Password undefined');
    response.status(400).send('Password undefined');
    return;
  }
  if(first_name === "" || first_name === undefined) {
    console.log('First name undefined');
    response.status(400).send('First name undefined');
    return;
  }
  if(last_name === "" || last_name === undefined) {
    console.log('Last name undefined');
    response.status(400).send('Last name undefined');
    return;
  }
  User.findOne({login_name: login_name}).exec(function(error, value) {
    if((value === null) || (value.length === 0)) {
      return User.create({
        login_name: login_name,
        password: password,
        first_name: first_name,
        last_name: last_name,
        location: location,
        occupation: occupation,
        description: description
        // password_digest: obj['hash']
        // salt: obj['salt']
      }).then((value1) => {
        value1.save();
        request.session.user = value1;
        request.session.user_id = value1['_id'];
        response.status(200).send(JSON.stringify(value1));
      }).catch((error) => {
        console.log(error);
        response.status(400).send('Exec error');
      });
    }
    console.log('User with login name:' + login_name + ' already exists.');
    response.status(400).send('User already exists');
  });
});

app.post('/admin/logout', function (request, response) {
  var id = request.session.user_id;
  request.session.destroy(function(error) {
    if(error) {
      console.log('Log out error');
      response.status(401).send('Log out error');
    } else {
      console.log('User logged out');
      response.status(200).send(JSON.stringify(id));
    }
  });
});

app.post('/commentsOfPhoto/:photo_id', function (request, response) {
  var id = request.params.photo_id;
  Photo.findOne({_id: id}).exec(function(error, value) {
    if(error) {
      console.log(error);
      response.status(400).send('Exec error');
    } else if(value === null) {
      console.log('Photo with id:' + id + ' not found.');
      response.status(400).send('Not found');
    } else {
      var d = new Date();
      value['comments'].push({
        comment: request.body.comment,
        user_id: request.session.user_id,
        date_time: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' '
      });
      value.save();
      response.status(200).send("Upload successful");
    }
  });
});

app.post('/photos/new', function (request, response) {
  processFormBody(request, response, function (err) {
      if (err || !request.file) {
          response.status(400).send("Exec error");
          return;
      }
      // request.file has the following properties of interest
      //      fieldname      - Should be 'uploadedphoto' since that is what we sent
      //      originalname:  - The name of the file the user uploaded
      //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
      //      buffer:        - A node Buffer containing the contents of the file
      //      size:          - The size of the file in bytes
      if (request.file.fieldname !== 'uploadedphoto') {
          response.status(400).send("Fieldname should be 'uploadedphoto'");
          console.log("Invalid fieldname");
          return;
      }

      if(request.file.mimetype !== 'image/jpg' && request.file.mimetype !== 'image/jpeg' && request.file.mimetype !== 'image/png') {
          response.status(400).send("Wrong file type");
          console.log("Invalid file type");
          return;
      }

      // XXX - Do some validation here.
      // We need to create the file in the directory "images" under an unique name. We make
      // the original file name unique by adding a unique prefix with a timestamp.
      var timestamp = new Date().valueOf();
      var filename = 'U' +  String(timestamp) + request.file.originalname;

      fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
        // XXX - Once you have the file written into your images directory under the name
        // filename you can create the Photo object in the database
        if(err) {
          response.status(400).send("Exec error");
        } else {
          Photo.create({
            file_name: filename,
            date_time: new Date(),
            user_id: request.session.user_id,
            comments: [],
            likes: []
          }).then((value) => {
            value.save();
            var photo = JSON.parse(JSON.stringify(value));
            response.status(200).send(JSON.stringify(photo));
          }).catch((error) => {
            response.status(400).send(error);
            console.log("Photo create error");
          });
        }
      });
  });
});

// Like photos
app.post('/likePhoto/:photo_id', function (request, response) {
  if(request.session === null || request.session == undefined || request.session.user === null || request.session.user === undefined) {
      response.status(401).send("User is not logged in.");
  } else {
      var photo_id = request.params.photo_id;
      var like = request.body.like;
      var user_id = request.session.user_id;
      Photo.findOne({_id: photo_id}).exec(function(error, value) {
        if(error) {
          console.log(error);
          response.status(400).send('Exec error');
        } else if(value === null) {
          console.log('Photo with id: ' + photo_id + ' not found.');
          response.status(400).send('Not found');
        } else {
          if(!like) {
            var index = value['likes'].indexOf(user_id);
            value['likes'].splice(index, 1);
          } else {
            value['likes'].push(user_id);
          }
          value.save();
          response.status(200).send();
        }
      });
  }
});

// Delete photos
app.post('/deletePhoto/:photo_id', function (request, response) {
  if(request.session === null || request.session == undefined || request.session.user === null || request.session.user === undefined) {
      response.status(401).send("User is not logged in.");
  } else {
      var photo_id = request.params.photo_id;
      Photo.deleteOne({'_id': photo_id}, function(error) {
        if(error) {
          console.log(error);
          response.status(400).send('Exec error');
        } else {
          response.status(200).send();
        }
      });
  }
});

// Delete comments
app.post('/deleteComment/:photo_id', function (request, response) {
  if(request.session === null || request.session == undefined || request.session.user === null || request.session.user === undefined) {
      response.status(401).send("User is not logged in.");
  } else {
    var id = request.params.photo_id;
    var commentId = request.body.commentId;
    Photo.findOne({_id: id}).exec(function(error, value) {
      if(error) {
        console.log(error);
        response.status(400).send('Exec error');
      } else if(value === null) {
        console.log('Photo with id:' + id + ' not found.');
        response.status(400).send('Not found');
      } else {
        var commentList = value['comments'];
        commentList = commentList.filter(function(comment) {
          if(comment['_id'].toString() === commentId) {
            return false;
          } else {
            return true;
          }
        });
        value['comments'] = commentList;
        value.save();
        response.status(200).send();
      }
    });
  }
});

// Delete users
app.post('/deleteUser/:id', function (request, response) {
  if(request.session === null || request.session == undefined || request.session.user === null || request.session.user === undefined) {
      response.status(401).send("User is not logged in.");
  } else {
    var id = request.params.id;
    Photo.deleteMany({user_id: id}, function(error) {
      if(error) {
        console.log(error);
        response.status(400).send('Exec error');
        return;
      }
    });
    Activity.deleteMany({user_id: id}, function(error) {
      if(error) {
        console.log(error);
        response.status(400).send('Exec error');
        return;
      }
    });
    Photo.find({}).exec(function(error, value) {
      if(error) {
        console.log(error);
        response.status(400).send('Exec error');
        return;
      }
      for(let i = 0; i < value.length; i++) {
        var commentList = value[i]['comments'];
        commentList = commentList.filter(function(comment) {
          if(comment['user_id'].toString() === id) {
            return false;
          } else {
            return true;
          }
        });
        value[i]['comments'] = commentList;
        var likeList = value[i]['likes'];
        if(likeList.includes(id)) {
          var index = likeList.indexOf(id);
          likeList.splice(index, 1);
          value[i]['likes'] = likeList;
        }
        value[i].save();
      }
    });
    User.deleteOne({_id: id}, function(error) {
      if(error) {
        console.log(error);
        response.status(400).send('Exec error');
        return;
      }
      request.session.destroy(function(error1) {
        if(error1) {
          console.log(error);
          response.status(401).send();
          return;
        } else {
          response.status(200).send();
          return;
        }
      });
    });
  }
});

// Get request from activity feed
app.get('/activity', function (request, response) {
  if(request.session === null || request.session == undefined || request.session.user === null || request.session.user === undefined) {
      response.status(401).send("User is not logged in.");
  } else {
      Activity.find({}).exec(function(error, value) {
        if(error) {
          response.status(400).send('Exec error');
          console.log(error);
          return;
        } else {
          value.sort(function(a, b) {
            return (b['date_time'] - a['date_time']);
          });
          var currActivityList = JSON.parse(JSON.stringify(value));
          var activityMessages = [];
          currActivityList.forEach((item, i) => {
            console.log(i);
            var currActivity = {};
            currActivity['file_name'] = "";
            currActivity['user_id'] = item['user_id'];
            currActivity['message'] = item['message'];
            currActivity['date_time'] = item['date_time'];
            currActivity['file_name'] = item['file_name'];
            activityMessages.push(currActivity);
          });
          if(activityMessages.length > 5) {
              activityMessages = activityMessages.slice(0, 5);
          }
          response.status(200).send(activityMessages);
        }
      });
  }
});

// Post request for activity feed
app.post('/newActivity', function (request, response) {
  var message = request.body.message;
  var file_name = request.body.file_name;
  var user_id = request.body.user_id;
  Activity.create({
    user_id: user_id,
    message: message,
    date_time: new Date(),
    file_name: file_name
  }).then((value) => {
    console.log(value);
    value.save();
    response.status(200).send();
  }).catch((error) => {
    console.log(error);
    response.status(400).send('Exec error');
  });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
