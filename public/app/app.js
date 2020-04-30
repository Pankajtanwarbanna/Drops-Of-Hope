angular.module('userApp', ['userRoutes','userCtrl','mainController','managementController','emailController','authServices'])

.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptors');
});