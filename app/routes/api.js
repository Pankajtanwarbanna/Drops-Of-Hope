/*
    API written by - Team Jagriti & Pankaj
*/
let User = require('../models/user');
let BloodRequest = require('../models/bloodRequest');
let auth = require('../auth/authUtils');
let jwt = require('jsonwebtoken');
let secret = 'zulu';
let nodemailer = require('nodemailer');
let sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function (router){

    // Nodemailer-sandgrid stuff
    let options = {
        auth: {
            api_key: 'YOUR_API_KEY'
        }
    };

    let client = nodemailer.createTransport(sgTransport(options));

    // User register API
    router.post('/register',function (req, res) {
        let user = new User();

        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.password = req.body.password;
        user.bloodGroup = req.body.bloodGroup;
        user.contactNo = req.body.contactNo;
        user.temporarytoken = jwt.sign({ email : user.email }, secret , { expiresIn : '24h' });

        //console.log(req.body);
        if(!user.firstName  || !user.lastName || !user.email || !user.password || !user.bloodGroup || !user.contactNo) {
            res.json({
                success : false,
                message : 'Ensure you filled all entries!'
            });
        } else {
            user.save(function(err) {
                if(err) {
                    if(err.errors != null) {
                        // validation errors
                        if (err.errors.email) {
                            res.json({
                                success : false,
                                message : err.errors.email.message
                            });
                        } else if(err.errors.password) {
                            res.json({
                                success : false,
                                message : err.errors.password.message
                            });
                        } else {
                            res.json({
                                success : false,
                                message : err
                            });
                        }
                    } else {
                        // duplication errors
                        if(err.code === 11000) {
                            //console.log(err.errmsg);
                            if(err.errmsg[57] === 'e') {
                                res.json({
                                    success: false,
                                    message: 'Email is already registered.'
                                });
                            }  else {
                                res.json({
                                    success : false,
                                    message : err
                                });
                            }
                        } else {
                            res.json({
                                success: false,
                                message: err
                            })
                        }
                    }
                } else {

                    let email = {
                        from: 'DropsOfHope Registration, support@dropsofhope.com',
                        to: user.email,
                        subject: 'Activation Link - DropsOfHope Registration',
                        text: 'Hello '+ user.name + 'Thank you for registering with us.Please find the below activation link Activation link Thank you Team CEO, DropsOfHope',
                        html: 'Hello <strong>'+ user.name + '</strong>,<br><br>Thank you for registering with us.Please find the below activation link<br><br><a href="http://localhost:8000/activate/'+ user.temporarytoken+'">Activation link</a><br><br>Thank you<br>Team DropsOfHope'
                    };

                    client.sendMail(email, function(err, info){
                        if (err ){
                            console.log(err);
                            res.json({
                                success : true,
                                message : 'Account created but email could not be send as email server is not responding. Contact Admin!'
                            })
                        }
                        else {
                            console.log('Message sent: ' + info.response);
                            res.json({
                                success : true,
                                message : 'Account registered! Please check your E-mail inbox for the activation link.'
                            });
                        }
                    });
                }
            });
        }
    });

    // User login API
    router.post('/authenticate', function (req,res) {

        if(!req.body.email || !req.body.password) {
            res.json({
                success : false,
                message : 'Ensure you fill all the entries.'
            });
        } else {

            User.findOne({ email : req.body.email }).select('email firstName lastName password active').exec(function (err, user) {

                if(err) throw err;

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found. Please Signup!'
                    });
                } else if(user) {

                    if(!user.active) {
                        res.json({
                            success : false,
                            message : 'Account is not activated yet.Please check your email for activation link.',
                            expired : true
                        });
                    } else {

                        let validPassword = user.comparePassword(req.body.password);

                        if (validPassword) {
                            let token = jwt.sign({
                                email: user.email
                            }, secret, {expiresIn: '24h'});
                            res.json({
                                success: true,
                                message: 'User authenticated.',
                                token: token
                            });
                        } else {
                            res.json({
                                success: false,
                                message: 'Incorrect password. Please try again.'
                            });
                        }
                    }
                }
            });
        }

    });

    router.put('/activate/:token', function (req,res) {

        if(!req.params.token) {
            res.json({
                success : false,
                message : 'No token provided.'
            });
        } else {

            User.findOne({temporarytoken: req.params.token}, function (err, user) {
                if (err) throw err;

                let token = req.params.token;

                jwt.verify(token, secret, function (err, decoded) {
                    if (err) {
                        res.json({
                            success: false,
                            message: 'Activation link has been expired.'
                        })
                    }
                    else if (!user) {
                        res.json({
                            success: false,
                            message: 'Activation link has been expired.'
                        });
                    } else {

                        user.temporarytoken = false;
                        user.active = true;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {

                                let email = {
                                    from: 'DropsOfHope Registration, support@dropsofhope.com',
                                    to: user.email,
                                    subject: 'Activation activated',
                                    text: 'Hello ' + user.name + 'Your account has been activated.Thank you Team, DropsOfHope',
                                    html: 'Hello <strong>' + user.name + '</strong>,<br><br> Your account has been activated.<br><br>Thank you<br>Team<br>CEO, DropsOfHope'
                                };

                                client.sendMail(email, function (err, info) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.log('Message sent: ' + info.response);
                                    }
                                });

                                res.json({
                                    success: true,
                                    message: 'Account activated.'
                                })

                            }
                        });
                    }
                });
            })
        }
    });

    // Resend activation link
    router.post('/resend', function (req,res) {

        if(!req.body.username || !req.body.password) {
            res.json({
                success : false,
                message : 'Ensure you fill all the entries.'
            });
        } else {

            User.findOne({ username : req.body.username }).select('name username email password active temporarytoken').exec(function (err,user) {

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User is not registered with us.Please signup!'
                    });
                } else {
                    if(user.active) {
                        res.json({
                            success : false,
                            message : 'Account is already activated.'
                        });
                    } else {

                        let validPassword = user.comparePassword(req.body.password);

                        if(!validPassword) {
                            res.json({
                                success : false,
                                message : 'Incorrect password.'
                            });
                        } else {
                            res.json({
                                success : true,
                                user : user
                            });

                        }
                    }
                }
            })
        }
    });

    // router to update temporary token in the database
    router.put('/sendlink', function (req,res) {

        User.findOne({username : req.body.username}).select('email username name temporarytoken').exec(function (err,user) {
            if (err) throw err;

            user.temporarytoken = jwt.sign({
                email: user.email,
                username: user.username
            }, secret, {expiresIn: '24h'});

            user.save(function (err) {
                if(err) {
                    console.log(err);
                } else {

                    let email = {
                        from: 'DropsOfHope Registration, support@dropsofhope.com',
                        to: user.email,
                        subject: 'Activation Link request - DropsOfHope Registration',
                        text: 'Hello '+ user.name + 'You requested for the new activation link.Please find the below activation link Activation link Thank you Team CEO, DropsOfHope',
                        html: 'Hello <strong>'+ user.name + '</strong>,<br><br>You requested for the new activation link.Please find the below activation link<br><br><a href="http://localhost:8080/activate/'+ user.temporarytoken+'">Activation link</a><br><br>Thank you<br>Team<br>CEO, DropsOfHope'
                    };

                    client.sendMail(email, function(err, info){
                        if (err ){
                            console.log(err);
                        }
                        else {
                            console.log('Message sent: ' + info.response);
                        }
                    });

                    res.json({
                        success : true,
                        message : 'Link has been successfully sent to registered email.'
                    });

                }
            })
        });
    });

    // Send link to email id for reset password
    router.put('/forgotPasswordLink', function (req,res) {

        if(!req.body.username) {
            res.json({
                success : false,
                message : 'Please ensure you filled the entries.'
            });
        } else {

            User.findOne({ username : req.body.username }).select('username email temporarytoken name').exec(function (err,user) {
                if(err) throw err;

                if(!user) {
                    res.json({
                        success : false,
                        message : 'Username not found.'
                    });
                } else {

                    console.log(user.temporarytoken);

                    user.temporarytoken = jwt.sign({
                        email: user.email
                    }, secret, {expiresIn: '24h'});

                    console.log(user.temporarytoken);

                    user.save(function (err) {
                        if(err) {
                            res.json({
                                success : false,
                                message : 'Error accured! Please try again. '
                            })
                        } else {

                            let email = {
                                from: 'DropsOfHope Registration, support@dropsofhope.com',
                                to: user.email,
                                subject: 'Forgot Password Request',
                                text: 'Hello '+ user.name + 'You request for the forgot password.Please find the below link Reset password Thank you Team CEO, DropsOfHope',
                                html: 'Hello <strong>'+ user.name + '</strong>,<br><br>You requested for the forgot password. Please find the below link<br><br><a href="http://localhost:8080/forgotPassword/'+ user.temporarytoken+'">Reset password</a><br><br>Thank you<br>Team<br>CEO, DropsOfHope'
                            };

                            client.sendMail(email, function(err, info){
                                if (err ){
                                    console.log(err);
                                }
                                else {
                                    console.log('Message sent: ' + info.response);
                                }
                            });

                            res.json({
                                success : true,
                                message : 'Link to reset your password has been sent to your registered email.'
                            });

                        }
                    });

                }

            })

        }
    });

    // router to change password
    router.post('/forgotPassword/:token', function (req,res) {

        if(!req.params.token) {
            res.json({
                success : false,
                message : 'No token provied.'
            });
        } else {

            User.findOne({ temporarytoken : req.params.token }).select('username temporarytoken').exec(function (err,user) {

                if(err) throw err;

                if(!user) {
                    res.json({
                        success : false,
                        message : 'Link has been expired.'
                    });
                } else {
                    res.json({
                        success : true,
                        user : user
                    });
                }
            });
        }
    });

    // route to reset password
    router.put('/resetPassword/:token', function (req,res) {

        if(!req.body.password) {
            res.json({
                success : false,
                message : 'New password is missing.'
            })
        } else {

            User.findOne({ temporarytoken : req.params.token }).select('name password').exec(function (err,user) {

                if(err) throw err;

                if(!user) {
                    res.json({
                        success : false,
                        message : 'Link has been expired.'
                    })
                } else {

                    user.password = req.body.password;
                    user.temporarytoken = false;

                    user.save(function (err) {
                        if(err) {
                            res.json({
                                success : false,
                                message : 'Password must have one lowercase, one uppercase, one special character, one number and minimum 8 and maximum 25 character.'
                            });
                        } else {

                            let email = {
                                from: 'DropsOfHope, support@dropsofhope.com',
                                to: user.email,
                                subject: 'Password reset',
                                text: 'Hello '+ user.name + 'You request for the reset password.Your password has been reset. Thank you Team CEO, DropsOfHope',
                                html: 'Hello <strong>'+ user.name + '</strong>,<br><br>You requested for the reset password. Your password has been reset.<br><br>Thank you<br>Team<br>CEO, DropsOfHope'
                            };

                            client.sendMail(email, function(err, info){
                                if (err ){
                                    console.log(err);
                                }
                                else {
                                    console.log('Message sent: ' + info.response);
                                }
                            });

                            res.json({
                                success : true,
                                message : 'Password has been changed successfully.'
                            })

                        }
                    })
                }
            })
        }
    });

    // Middleware to verify token
    router.use(function (req,res,next) {

        let token = req.body.token || req.body.query || req.headers['x-access-token'];

        if(token) {
            // verify token
            jwt.verify(token, secret, function (err,decoded) {
                if (err) {
                    res.json({
                        success : false,
                        message : 'Token invalid.'
                    })
                }
                else {
                    req.decoded = decoded;
                    next();
                }
            });

        } else {
            res.json({
                success : false,
                message : 'No token provided.'
            });
        }
    });

    // API User profile
    router.post('/me', function (req,res) {

        //console.log(req.decoded.email);
        // getting profile of user from database using email, saved in the token in localStorage
        User.findOne({ email : req.decoded.email }).select('email firstName').exec(function (err, user) {
            if(err) throw err;

            if(!user) {
                res.status(500).send('User not found.');
            } else {
                res.send(user);
            }
        });
    });

    // get permission of user
    router.get('/permission', function (req,res) {

        User.findOne({ email : req.decoded.email }).select('permission').exec(function (err,user) {

            if(err) throw err;

            if(!user) {
                res.json({
                    success : false,
                    message : 'User not found.'
                })
            } else {
                res.json({
                    success : true,
                    permission : user.permission
                })
            }
        })
    });

    // get all users
    router.get('/management', function (req, res) {

        User.find({}, function (err, users) {

            if(err) throw err;
            User.findOne({ username : req.decoded.username }, function (err,mainUser) {

                if(err) throw err;
                if(!mainUser) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    if(!users) {
                        res.json({
                            success : false,
                            message : 'Users not found.'
                        });
                    } else {
                        res.json({
                            success : true,
                            users : users,
                            permission : mainUser.permission
                        })
                    }
                }
            })
        })
    });

    // delete a user form database
    router.delete('/management/:username', function (req,res) {

        let deletedUser = req.params.username;

        User.findOne({ username : req.decoded.username }, function (err,mainUser) {

            if(err) throw err;

            if(!mainUser) {
                res.json({
                    success : false,
                    message : 'User not found.'
                });
            } else {
                if(mainUser.permission !== 'admin') {
                    res.json({
                        success : false,
                        message : 'Insufficient permission'
                    });
                } else {
                    User.findOneAndRemove({ username : deletedUser }, function (err,user) {
                        if(err) throw err;

                        res.json({
                            success : true,
                        });
                    });
                }
            }
        })
    });

    // route to edit user
    router.get('/edit/:id', function (req,res) {
        let editedUser = req.params.id;

        User.findOne({ username : req.decoded.username }, function (err,mainUser) {
            if(err) throw err;

            if(!mainUser) {
                res.json({
                    success : false,
                    message : 'User not found...'
                });
            } else {
                if(mainUser.permission === 'admin') {

                    User.findOne({ _id : editedUser }, function (err, user) {

                        if(err) throw err;

                        if(!user) {
                            res.json({
                                success : false,
                                message : 'User not found.'
                            });
                        } else {
                            res.json({
                                success : true,
                                user : user
                            })
                        }

                    })

                } else {
                    res.json({
                        success : false,
                        message : 'Insufficient permission.'
                    })
                }
            }
        })
    });

    // update user details
    router.put('/edit', function (req,res) {

        let editedUser = req.body._id;

        if(req.body.name) {
            let newName = req.body.name;
        }
        if(req.body.username) {
            let newUsername = req.body.username;
        }
        if(req.body.email) {
            let newEmail = req.body.email;
        }
        if(req.body.permission) {
            let newPermission = req.body.permission;
        }

        User.findOne({ username : req.decoded.username }, function (err,mainUser) {
            if(err) throw err;

            if(!mainUser) {
                res.json({
                    success : false,
                    message : 'User not found'
                });
            } else {
                if(mainUser.permission === 'admin') {

                    // update name
                    if(newName) {
                        User.findOne({ _id : editedUser }, function (err,user) {
                            if(err) throw err;

                            if(!user) {
                                res.json({
                                    success : false,
                                    message : 'User not found.'
                                });
                            } else {
                                user.name = newName;
                                user.save(function (err) {
                                    if(err) {
                                        if(err.errors.name) {
                                            res.json({
                                                success : false,
                                                message : err.errors.name.message
                                            })
                                        } else {
                                            res.json({
                                                success : false,
                                                message : 'Error! Please try again.'
                                            })
                                        }
                                    }

                                    else {

                                        res.json({
                                            success : true,
                                            message : 'Name has been updated.'
                                        });
                                    }

                                })
                            }

                        })
                    }

                    // update username
                    if(newUsername) {
                        User.findOne({ _id : editedUser }, function (err,user) {
                            if(err) throw err;

                            if(!user) {
                                res.json({
                                    success : false,
                                    message : 'User not found.'
                                });
                            } else {
                                user.username = newUsername;
                                user.save(function (err) {
                                    if(err) {
                                        if(err.errors) {
                                            res.json({
                                                success : false,
                                                message : err.errors.username.message
                                            })
                                        } else {
                                            res.json({
                                                success : false,
                                                message : 'Username is not unique.'
                                            })
                                        }
                                    }

                                    res.json({
                                        success : true,
                                        message : 'Username has been updated.'
                                    })
                                })
                            }

                        })
                    }

                    // update email
                    if(newEmail) {
                        User.findOne({ _id : editedUser }, function (err,user) {
                            if(err) throw err;

                            if(!user) {
                                res.json({
                                    success : false,
                                    message : 'User not found.'
                                });
                            } else {
                                user.email = newEmail;
                                user.save(function (err) {
                                    if(err) {
                                        if(err.errors) {
                                            console.log(err.errors);
                                            res.json({
                                                success : false,
                                                message : err.errors.email.message
                                            })
                                        } else {
                                            res.json({
                                                success : false,
                                                message : 'User is already registered with us.'
                                            })
                                        }
                                    } else {
                                        res.json({
                                            success : true,
                                            message : 'Email has been updated.'
                                        });
                                    }

                                })
                            }

                        })
                    }

                    // update permission
                    if(newPermission) {
                        User.findOne({ _id : editedUser }, function (err,user) {
                            if(err) throw err;

                            if(!user) {
                                res.json({
                                    success : false,
                                    message : 'User not found.'
                                });
                            } else {
                                console.log(user.permission);
                                console.log(mainUser.permission);

                                if(user.permission === 'user' && mainUser.permission === 'admin') {
                                    user.permission = 'admin';

                                    user.save(function (err) {
                                        if(err) {
                                            res.json({
                                                success : false,
                                                message : 'Can not upgrade to admin'
                                            });
                                        } else {
                                            res.json({
                                                success : true,
                                                message : 'Successfully upgraded to admin.'
                                            })
                                        }
                                    });

                                } else if(user.permission === 'user' && mainUser.permission === 'user') {
                                    res.json({
                                        success : false,
                                        message : 'Insufficient permission.'
                                    })
                                } else if(user.permission === 'admin' && mainUser.permission === 'admin') {
                                    res.json({
                                        success : false,
                                        message : 'Role is already admin.'
                                    })
                                } else if (user.permission === 'admin' && mainUser.permission === 'user') {
                                    res.json({
                                        success : false,
                                        message : 'Insufficient permission.'
                                    })
                                } else {
                                    res.json({
                                        success : true,
                                        message : 'Please try again later.'
                                    })
                                }
                            }

                        });
                    }


                } else {
                    res.json({
                        success : false,
                        message : 'Insufficient permission.'
                    })
                }
            }
        });
    });

    //Post Blood Request
    router.post('/postBloodRequest', auth.ensureLoggedIn , function (req, res) {

        // new Blood Request obj
        let bloodRequest = new BloodRequest();

        bloodRequest.patientName = req.body.patientName;
        bloodRequest.patientAge = req.body.patientAge;
        bloodRequest.patientGender = req.body.patientGender;
        bloodRequest.patientMobile = req.body.patientMobile;
        bloodRequest.requiredDate = req.body.requiredDate;
        bloodRequest.bloodGroup = req.body.bloodGroup;
        bloodRequest.condition = req.body.condition;
        bloodRequest.unitsRequired = req.body.unitsRequired;
        bloodRequest.hospitalName = req.body.hospitalName;
        bloodRequest.hospitalAddress = req.body.hospitalAddress;
        bloodRequest.purpose = req.body.purpose;
        bloodRequest.requestedBy = req.decoded.email;
        bloodRequest.timestamp = new Date();

        bloodRequest.save(function (err) {
            if(err) {
                if(err.errors != null) {
                    // validation errors
                    if (err.errors.patientMobile) {
                        res.json({
                            success : false,
                            message : err.errors.patientMobile.message
                        });
                    } else if(err.errors.purpose) {
                        res.json({
                            success : false,
                            message : err.errors.purpose.message
                        });
                    } else {
                        res.json({
                            success: false,
                            message: err
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        message: 'Something went wrong!'
                    })
                }
            } else {
                res.json({
                    success : true,
                    message : 'Blood request successfully posted.'
                })
            }
        });
    });

    // Route to get all blood requests
    router.get('/getAllBloodRequests', auth.ensureLoggedIn, function (req, res) {
        BloodRequest.find({ }, function (err, bloodRequests) {
            if(err) {
                res.json({
                    success : false,
                    message : 'Something went wrong!'
                })
            } else if(!bloodRequests) {
                res.json({
                    success : false,
                    message : 'Blood requests not found.'
                })
            } else {
                res.json({
                    success : true,
                    bloodRequests : bloodRequests
                })
            }
        })
    });

    // get blood request
    router.get('/getRequestData/:requestID', auth.ensureLoggedIn, function (req, res) {
        BloodRequest.findOne({ _id : req.params.requestID }, function (err, bloodRequest) {
            if(err) {
                res.json({
                    success : false,
                    message : 'Something went wrong!'
                })
            } else if(!bloodRequest) {
                res.json({
                    success : false,
                    message : 'Blood requests not found.'
                })
            } else {
                res.json({
                    success : true,
                    bloodRequest : bloodRequest
                })
            }
        })
    });

    // get all donors
    router.get('/getDonors', auth.ensureLoggedIn, function (req, res) {
        User.find({ }, function(err, donors) {
            if(err) {
                res.json({
                    success : false,
                    message : 'Something went wrong!'
                })
            } else {
                if(!donors) {
                    res.json({
                        success : false,
                        message : 'Donors not found.'
                    })
                } else {
                    res.json({
                        success : true,
                        donors : donors
                    })
                }
            }
        })
    });

    // Get user profile route
    router.get('/getUserProfile',auth.ensureLoggedIn, function (req, res) {

        User.findOne({ email : req.decoded.email }, function (err, user) {
            if(err) {
                res.json({
                    success : false,
                    message : 'Something went wrong!'
                })
            } else {
                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    })
                } else {
                    res.json({
                        success : true,
                        user : user
                    })
                }
            }
        })
    });

    // router to update user's password
    router.post('/updatePassword', auth.ensureLoggedIn, function (req, res) {
        User.findOne({ email : req.decoded.email }).select('email firstName password').exec(function (err, user) {
            if(err) {
                res.json({
                    success : false,
                    message : 'Database side error.'
                })
            }

            if(!user) {
                res.json({
                    success : false,
                    message : 'User not found.'
                })
            } else {
                let validPassword = user.comparePassword(req.body.oldPassword);

                if(validPassword) {
                    user.password = req.body.newPassword;

                    //console.log(user.password);

                    user.save(function (err) {
                        if (err) {
                            if(err.errors != null) {
                                // validation errors
                                if(err.errors.password) {
                                    res.json({
                                        success : false,
                                        message : err.errors.password.message
                                    });
                                } else {
                                    res.json({
                                        success : false,
                                        message : err
                                    });
                                }
                            } else {
                                res.json({
                                    success : false,
                                    message : 'Something went wrong.'
                                })
                            }
                        } else {

                            let email = {
                                from: '"DropsOfHope" <dropsofhope@gmail.com>',
                                to: user.email,
                                subject: 'Password Changed Successfully!',
                                text: 'Hello '+ user.firstName + 'You request for the change password.Password has been successfully changed. Thank you',
                                html: 'Hello <strong>'+ user.firstName + '</strong>,<br><br>You requested for the change password. Your password has been successfully changed.<br><br>Thank you<br>Team DropsOfHope<br>MNIT Jaipur'
                            };

                            client.sendMail(email, function(err, info){
                                if (err){
                                    console.log(err);
                                    res.json({
                                        success : true,
                                        message : 'Password has been changed successfully!' // email server is not responding
                                    });
                                }
                                else {
                                    console.log('Message sent: ' + info.response);
                                    res.json({
                                        success : true,
                                        message : 'Password has been changed successfully.'
                                    });
                                }
                            });
                        }
                    })
                } else {
                    res.json({
                        success : false,
                        message : 'Incorrect old password.'
                    })
                }
            }
        });
    });

    return router;
};

