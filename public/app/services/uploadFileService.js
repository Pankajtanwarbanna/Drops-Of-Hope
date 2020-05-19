angular.module('uploadFileService', [])

.service('uploadFile', function ($http) {

    this.upload = function (file) {
        var fd = new FormData();

        fd.append('myfile', file.myfile);
        return $http.post('/api/upload', fd, {
            transformRequest: angular.identity,
            headers : { 'content-type' : undefined }
        })
    };

    // Upload Image
    this.uploadImage = function (file) {

        let fd = new FormData();

        fd.append( 'thumbnail', file.thumbnail);

        return $http.post('/api/uploadImage', fd, {
            transformRequest: angular.identity,
            headers : { 'content-type' : undefined }
        })
    };

    // Upload Video
    this.uploadVideo = function (file) {

        let fd = new FormData();

        fd.append( 'video', file.video);

        return $http.post('/api/uploadVideo', fd, {
            transformRequest: angular.identity,
            headers : { 'content-type' : undefined }
        })

    }
})
