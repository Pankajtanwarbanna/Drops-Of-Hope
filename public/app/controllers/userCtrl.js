angular.module('userCtrl',['userServices'])

.controller('regCtrl', function ($scope, $http, $timeout, $location,user) {

    var app = this;

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

    // Post Blood Request Form Submit Function
    app.postBloodRequest = function (requestData) {
        console.log(app.requestData);

        // post blood request API
        user.postBloodRequest(app.requestData).then(function (data) {
            console.log(data);
            if(data.data.success) {
                app.successMsg = data.data.message;
            } else {
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

    // Fetch all blood requests
    user.getAllBloodRequests().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.bloodRequests = data.data.bloodRequests;
        } else {
            app.errorMsg = data.data.message;
        }
    })

});

