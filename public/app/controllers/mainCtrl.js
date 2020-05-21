angular.module('mainController', ['authServices'])

.controller('mainCtrl', function ($window,$http, auth, $timeout, $location, authToken, $rootScope, user) {

    var app = this;

    app.loadme = false;
    app.home = true;

    $rootScope.$on('$routeChangeStart', function (event, next, current) {

        //console.log('user is changing routes');
        //console.log($window.location.pathname);
        if(next.$$route) {
            //console.log('we are not at home page');
            app.home = false;
        } else {
            app.home = true;
        }

        if(auth.isLoggedIn()) {

            //console.log('User is logged in.');
            app.isLoggedIn = true;
            auth.getUser().then(function (data){
                //console.log(data);
                app.firstName = data.data.firstName;
                app.email = data.data.email;
                app.profile_url = data.data.profile_url;
                user.getPermission().then(function (data) {
                    if(data.data.permission === 'admin') {
                        app.authorized = true;
                        app.loadme = true
                    } else {
                        app.authorized = false;
                        app.loadme = true;
                    }
                });
            });

        } else {

            //console.log('User is not logged in.');
            app.isLoggedIn = false;
            app.name = '';

            app.loadme = true;
        }

    });


    this.doLogin = function (logData) {
        console.log(this.logData);
        app.successMsg = '';
        app.errorMsg = '';
        app.loading = true;
        app.expired = false;
        app.disabled = false;

        auth.login(app.logData).then(function (data) {
            //console.log(data);
            //app.loading = true;

            if(data.data.success) {
                app.loading = false;
                app.successMsg = data.data.message + ' Redirecting to home page...';
                $timeout(function () {
                    $location.path('/');
                    app.logData = {};
                    app.successMsg = false;
                }, 2000);

            } else {
                app.disabled = false;
                if(data.data.expired) {
                    app.disabled = true;
                    app.loading = false;
                    app.errorMsg = data.data.message;
                    app.expired = data.data.expired;
                } else {
                    app.loading = false;
                    app.errorMsg = data.data.message;
                }
            }
        });
    };

    this.logout = function () {
        auth.logout();
        $location.path('/logout');
        $timeout(function () {
            $location.path('/');
        }, 2000);
    };

    // blood groups array
    app.bloodGroups = [
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'A1+',
        'A1-',
        'A1B+',
        'A1B-',
        'A2+',
        'A2-',
        'A2B+',
        'A2B-',
        'O+',
        'O-'
    ];

    // get all users
    user.getAllUsers().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.users = data.data.users;
        }
    });

    // get all donors
    user.getAllDonors().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.donors = data.data.donors;
        }
    });

    // get all requests
    user.getAllRequests().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.requests = data.data.requests;
        }
    });

    // get all open requests
    user.getAllOpenRequests().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.openrequests = data.data.openrequests;
        }
    });

    // get all closed requests
    user.getAllClosedRequests().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.closedrequests = data.data.closedrequests;
        }
    });

    // get all doctors
    user.getAllDoctors().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.doctors = data.data.doctors;
        }
    });

    // get all your views
    user.getAllYourViews().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.yourviews = data.data.yourviews;
        }
    });

    // get all blogs
    user.getAllBlogs().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.blogs = data.data.blogs;
        }
    });

});
