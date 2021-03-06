angular.module('userCtrl',['userServices','fileModelDirective','uploadFileService','btford.socket-io'])


// File Upload
    /*
uploadFile.upload($scope.file).then(function (data) {
    console.log(data);
})
uploadFile.uploadImage($scope.file).then(function (data) {
    console.log(data);
})
*/
.service('SocketService', ['socketFactory', function SocketService(socketFactory) {
    return socketFactory({
        ioSocket: io.connect('localhost:8000')
    });
}])


.controller('regCtrl', function ($scope, $http, $timeout, $location,user) {

    var app = this;

    // loading
    app.loading = false;

    this.regUser = function (regData) {

        console.log(app.regData);

        app.successMsg = '';
        app.errorMsg = '';
        app.loading = true;

        if(app.regData.password !== app.regData.confirmPassword) {
            app.loading = false;
            app.errorMsg = 'Password didn\'t match.'
        } else {
            user.create(app.regData).then(function (data) {

                console.log(data);
                if(data.data.success) {
                    app.loading = false;
                    app.successMsg = data.data.message + ' Redirecting to home page...';
                    $timeout(function () {
                        $location.path('/');
                    }, 2000);

                } else {
                    app.loading = false;
                    app.errorMsg = data.data.message;
                }
            });
        }
    };
})

// Post Blood Request Controller
.controller('bloodRequestCtrl', function (user) {
    let app = this;

    // loading false
    app.loading = false;

    // Post Blood Request Form Submit Function
    app.postBloodRequest = function (requestData) {
        //console.log(app.requestData);
        app.loading = true;

        app.bloodGroupObj = {};
        app.bloodGroupObj.bloodGroup = app.requestData.bloodGroup;
        //console.log(app.bloodGroupObj);
        // post blood request API
        user.postBloodRequest(app.requestData).then(function (data) {
            console.log(data);
            if(data.data.success) {
                app.loading = false;
                app.successMsg = data.data.message + ' Potential Donors has been notified.';

                // notify via msg
                console.log(app.bloodGroupObj);
                user.getPotentialDonors(app.bloodGroupObj).then(function (data) {
                    console.log(data);
                    if(data.data.success) {
                        user.sendBloodRequestMsg(data.data.contact ).then(function (data) {
                            console.log(data);
                        })
                    }
                })
            } else {
                app.loading = false;
                app.errorMsg = data.data.message;
            }
        })
    };

})

// View All Blood Request Controller
.controller('viewAllBloodRequestCtrl', function (user) {
    let app = this;

    // loading
    app.loading = true;

    // Fetch all blood requests
    user.getAllBloodRequests().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.loading = false;
            app.bloodRequests = data.data.bloodRequests;
        } else {
            app.loading = false;
            app.errorMsg = data.data.message;
        }
    });

})

// find donor controller
.controller('findDonorCtrl', function (user) {

    let app = this;

    // get all donors 
    user.getDonors().then(function (data) {
        console.log(data.data.donors);
        if(data.data.success) {
            app.donors = data.data.donors;
        } else {
            app.errorMsg = data.data.message;
        }
    })
})

// user profile controller
.controller('profileCtrl', function (user, uploadFile, $scope, $timeout) {

    let app = this;

    // user profile details
    function getUserProfileFunction() {
        user.getUserProfile().then(function (data) {
            console.log(data);
            if(data.data.success) {
                app.user = data.data.user;
            } else {
                app.errorMsg = data.data.message;
            }
        });
    }

    getUserProfileFunction();

    // user posted blood requests
    function getUserPostedBloodRequestsFunction() {
        user.getUserPostedBloodRequests().then(function (data) {
            console.log(data);
            if(data.data.success) {
                app.requests = data.data.requests;
            } else {
                app.errorMsg = data.data.message;
            }
        });
    }

    getUserPostedBloodRequestsFunction();

    app.loading = false;

    // upload profile picture
    app.updateProfilePicture = function() {
        app.loading = true;
        uploadFile.uploadImage($scope.file).then(function (data) {
            //console.log(data);
            let filenameObj = {};
            filenameObj.filename = data.data.filename;
            if(data.data.success) {
                user.updateProfilePictureURL(filenameObj).then(function (status) {
                    //console.log(status);
                    if(status.data.success) {
                        app.profileUpdateSuccessMsg = data.data.message;
                        getUserProfileFunction();
                        app.loading = false;
                    } else {
                        app.loading = false;
                        app.errorMsg = data.data.message;
                    }
                });
            } else {
                app.loading = false;
                app.errorMsg = data.data.message;
            }
        })
    };

    // update user profile details.
    app.updateUserProfileDetails = function () {
        app.updateLoading = true;
        //console.log(app.user);
        user.updateUserProfileDetails(app.user).then(function (data) {
            //console.log(data);
            if(data.data.success) {
                app.updateLoading = false;
                app.updateSuccessMsg = data.data.message;
                $timeout(function () {
                    app.updateSuccessMsg = '';
                }, 3000);
            } else {
                app.updateLoading = false;
                app.errorMsg = data.data.message;
            }
        })
    }
})

// user account settings controller
.controller('settingsCtrl', function (user) {

    let app = this;

    app.loading = false;

    // update password function
    app.updatePassword = function (passwordData) {

        app.errorMsg = '';
        app.loading = true;

        console.log(app.passwordData);
        if(app.passwordData.newPassword !== app.passwordData.confirmNewPassword) {
            app.loading = false;
            app.errorMsg = 'Password didn\'t match.'
        } else {
            user.updatePassword(app.passwordData).then(function (data) {
                if(data.data.success) {
                    app.loading = false;
                    app.successMsg = data.data.message;
                } else {
                    app.loading = false;
                    app.errorMsg = data.data.message;
                }
            })
        }
    }
})

// request controller
.controller('requestCtrl', function ($routeParams, user) {

    let app = this;

    app.loading = true;

    // get request data
    function getBloodRequestData() {
        user.getRequestData($routeParams.requestID).then(function (data) {
            console.log(data);
            if(data.data.success) {
                app.bloodRequest = data.data.bloodRequest[0];
            } else {
                app.errorMsg = data.data.message;
            }
        });
    }

    getBloodRequestData();

    // show willingness to donate
    app.showWillingness = function () {
        user.showWillingness($routeParams.requestID).then(function (data) {
            console.log(data);
            if(data.data.success) {
                app.willingnessSuccessMsg = data.data.message;
                getBloodRequestData();
            } else {
                app.willingnessErrorMsg = data.data.message;
            }
        })
    }
})

// story post controller

.controller('storyCtrl', function (user, $scope, uploadFile) {

    let app = this;

    app.postNewStory = function () {

        app.loading = true;
        app.errorMsg = '';
        app.successMsg = '';

        uploadFile.uploadImage($scope.file).then(function (data) {
            console.log(data);
            let storyObj = {};
            storyObj.filename = data.data.filename;
            storyObj.story = app.storyData.story;
            console.log(storyObj);

            if(data.data.success) {
                user.uploadStory(storyObj).then(function (data) {
                    //console.log(status);
                    if(data.data.success) {
                        app.successMsg = data.data.message;
                        app.loading = false;
                    } else {
                        app.loading = false;
                        app.errorMsg = data.data.message;
                    }
                });
            } else {
                app.loading = false;
                app.errorMsg = data.data.message;
            }
        })

    }

})

// photos controller
.controller('photosCtrl', function (user) {

    let app = this;

    // get all stories
    user.getAllStories().then(function (data) {
        if(data.data.success) {
            app.stories = data.data.stories;
        } else {
            app.errorMsg = data.data.message;
        }
    })
})

// consultation controller
.controller('consultationCtrl', function (user) {

    let app = this;

    // get all doctors
    user.getAllDoctors().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.doctors = data.data.doctors;
        } else {
            app.errorMsg = data.data.message;
        }
    });

    // all open chats
    user.getAllOpenConsultations().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.chats = data.data.chats;
        } else {
            app.errorMsg =data.data.message;
        }

    });

    // start chat
    app.startChat = function (chatData) {

        app.loading = true;

        user.startChat(app.chatData).then(function (data) {
            console.log(data);
            if(data.data.success) {
                app.loading = false;
                app.successMsg = data.data.message;
            } else {
                app.loading = false;
                app.errorMsg = data.data.message;
            }
        })
    }
})

// consultation controller
.controller('chatCtrl', function (user, SocketService, $scope, $routeParams) {

    let app = this;

    $scope.message = {};

    SocketService.on('connect' , function () {
        // user is connected.
        console.log('user connect.')
    });

    // Joined Chat
    SocketService.emit('room', { chatID : $routeParams.chatID });

    app.sendMessage = function(data, email) {
        console.log(app.data);
        let messageData = {};

        messageData.chatID = $routeParams.chatID;
        messageData.message = app.data.message;
        messageData.sender = email;
        messageData.timestamp = new Date();

        SocketService.emit('send message', { data: messageData })
        app.data.message = '';
        //$scope.array.push({ data: $scope.message, date: new Date() })
    };

    SocketService.on('new message', function(data) {
        console.log(data);
        app.chats.push(data.data);
    });

    // get all chat messages
    user.getAllChats($routeParams.chatID).then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.consultation = data.data.consultation[0];
            app.chats = data.data.consultation[0].chat;
        } else {
            app.errorMsg = data.data.message;
        }
    })

});

