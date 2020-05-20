angular.module('userServices',[])

.factory('user', function ($http) {
    var userFactory = {};

    // user.create(regData);
    userFactory.create = function (regData) {
        return $http.post('/api/register' , regData);
    };

    // user.activateAccount(token);
    userFactory.activateAccount = function (token) {
        return $http.put('/api/activate/'+token);
    };

    // user.resendLink(logData);
    userFactory.checkCredentials = function (logData) {
        return $http.post('/api/resend',logData);
    };

    // user.resendEmail(username);
    userFactory.resendEmail = function (username) {
        return $http.put('/api/sendlink', username);
    };

    // user.forgotUsername(email);
    userFactory.forgotUsername = function (email) {
        return $http.post('/api/forgotUsername', email);
    };

    // user.forgotPasswordLink(username);
    userFactory.forgotPasswordLink = function (username) {
        return $http.put('/api/forgotPasswordLink', username);
    };

    // user.forgotPasswordCheckToken(token);
    userFactory.forgotPasswordCheckToken = function (token) {
        return $http.post('/api/forgotPassword/'+token);
    };

    // user.resetPassword(token,password);
    userFactory.resetPassword = function (token,password) {
        return $http.put('/api/resetPassword/'+token, password);
    };

    // user.getPermission();
    userFactory.getPermission = function () {
        return $http.get('/api/permission');
    };

    // post blood request
    userFactory.postBloodRequest = function (requestData) {
        return $http.post('/api/postBloodRequest', requestData);
    };

    // get all blood requests
    userFactory.getAllBloodRequests = function () {
        return $http.get('/api/getAllBloodRequests');
    };

    // get blood reuqest data as per id
    userFactory.getRequestData = function(requestID) {
        return $http.get('/api/getRequestData/' + requestID);
    };

    // get all donors
    userFactory.getDonors = function () {
        return $http.get('/api/getDonors');
    };

    // get user profile
    userFactory.getUserProfile = function () {
        return $http.get('/api/getUserProfile');
    };

    // update user password
    userFactory.updatePassword = function (passwordData) {
        return $http.post('/api/updatePassword', passwordData);
    };

    // get user posted blood requests
    userFactory.getUserPostedBloodRequests = function () {
        return $http.get('/api/getUserPostedBloodRequests');
    };

    // show willingness
    userFactory.showWillingness = function (requestID) {
        return $http.post('/api/showWillingness/' + requestID);
    };

    // update profile picture
    userFactory.updateProfilePictureURL = function (requestData) {
        return $http.post('/api/updateProfilePictureURL', requestData);
    };

    // update user profile details
    userFactory.updateUserProfileDetails = function (userData) {
        return $http.post('/api/updateUserProfileDetails' , userData);
    };

    // upload story
    userFactory.uploadStory = function (storyData) {
        return $http.post('/api/uploadStory', storyData);
    };

    // get all stories
    userFactory.getAllStories = function () {
        return $http.get('/api/getAllStories');
    };

    return userFactory;
});
