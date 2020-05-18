angular.module('userCtrl',['userServices'])

.controller('regCtrl', function ($scope, $http, $timeout, $location,user) {

    var app = this;

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

    this.regUser = function (regData) {

        console.log(app.regData);

        app.successMsg = '';
        app.errorMsg = '';
        app.loading = true;

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
    };
})

// Post Blood Request Controller
.controller('bloodRequestCtrl', function (user) {
    let app = this;

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

    // loading false
    app.loading = false;

    // Post Blood Request Form Submit Function
    app.postBloodRequest = function (requestData) {
        //console.log(app.requestData);
        app.loading = true;

        // post blood request API
        user.postBloodRequest(app.requestData).then(function (data) {
            console.log(data);
            if(data.data.success) {
                app.loading = false;
                app.successMsg = data.data.message;
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
.controller('profileCtrl', function (user) {

    let app = this;

    user.getUserProfile().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.user = data.data.user;
        } else {
            app.errorMsg = data.data.message;
        }
    })
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
    user.getRequestData($routeParams.requestID).then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.bloodRequest = data.data.bloodRequest;
        } else {
            app.errorMsg = data.data.message;
        }
    })
});
