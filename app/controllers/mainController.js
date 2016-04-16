'use strict';

angular.module('app').controller('MainController', ['$scope', 'ServerService', 'UiBasicService', '$timeout', '$mdDialog', '$q', '$sanitize', '$window',
    function($scope, $server, $uiBasic, $timeout, $mdDialog, $q, $sanitize, $window) {
        $scope.titleShown = true;
        $scope.isPhonePortrait = $window.innerWidth <= 700;

        // prevent overscroll in iOS
        $(document).on('touchmove', function(ev) {
            ev.preventDefault();
        });

        function loadData() {
            return $q(function(resolve, reject) {
                $server.loadData()
                    .then(function(tabletop) {
                        var groups = tabletop.sheets('Groups').all();
                        var activities = tabletop.sheets('Activities').all();

                        var tempGroups = [];
                        for (var i = 0; i < groups.length; i++) {
                            groups[i].arrayId = i;
                            groups[i].activities = [];
                            tempGroups[groups[i].type] = groups[i];
                        }

                        for (var i = 0; i < activities.length; i++) {
                            tempGroups[activities[i].type].activities.push(activities[i]);
                            activities[i].colorbox = tempGroups[activities[i].type].colorbox;
                        }

                        $scope.activityGroups = groups;
                        $scope.resultInterpretation = tabletop.sheets('Result Interpretation').all();
                        $scope.baselines = tabletop.sheets('Baselines').all();
                        var settings = tabletop.sheets('Settings').all();

                        $scope.settings = [];
                        for (var i = 0; i < settings.length; i++)
                            $scope.settings[settings[i]['setting']] = settings[i]['value'];

                        if (angular.isDefined($scope.settings['facebookAppId']) && $scope.settings['facebookAppId'] != "") {
                            window.initFb($scope.settings['facebookAppId']);
                        }
                        if (angular.isDefined($scope.settings['googleAnalyticsID'])) {
                            initTracking($scope.settings['googleAnalyticsID']);
                        }
                        resolve();
                    }, function(tabletop) {
                        reject('Failed to load data.');
                    });
            });
        }

        var dataPromise = loadData();

        dataPromise.then(function() {
            console.log('Data is ready.');

            $scope.selectActivityGroup($scope.activityGroups[0]);

            var landingImageDeferred = $q.defer();
            var image = document.createElement('img');
            image.src = $scope.settings.landingPageBackground;
            image.onload = function() {
                landingImageDeferred.resolve();
            };

            var image2 = document.createElement('img');
            image2.src = $scope.settings.resultsPageBackground;

            return landingImageDeferred.promise;
        }).then(function() {
            console.log('Image is ready.');

            $scope.screenState = 'starting';
        });

        // initial values
        $scope.screenState = 'initializing'; // initializing, starting, calculating, results
        $scope.totalFootprint = 0;
        $scope.completedGroupsCount = 0;

        var calculateColumnPositions = function() {
            switch ($scope.screenState) {
                case 'initializing':
                case 'starting':
                    for (var i = 0; i < $scope.activityGroups.length; i++)
                        $scope.activityGroups[i].left = $window.innerWidth;
                    $scope.resultLeft = $window.innerWidth;
                    break;
                case 'calculating':
                    var columnWidth,
                        columnCount = $scope.activityGroups.length,
                        remainingWidth;

                    if (!$scope.isPhonePortrait) {
                        columnWidth = 280;
                        remainingWidth = $window.innerWidth - columnWidth;

                        var collapsedColumnWidth = Math.round((remainingWidth - columnWidth) / (columnCount - 1));
                        $scope.activityGroups[0].left = 0;
                        for (var i = 0; i < $scope.activityGroups.length - 1; i++) {
                            if (!$scope.activityGroups[i].selected)
                                $scope.activityGroups[i + 1].left = $scope.activityGroups[i].left + collapsedColumnWidth;
                            else
                                $scope.activityGroups[i + 1].left = $scope.activityGroups[i].left + columnWidth;
                        }

                        $scope.resultLeft = $window.innerWidth - 280;
                    } else {
                        columnWidth = $window.innerWidth - 40;
                        remainingWidth = columnWidth;

                        var i;
                        for (i = 0; i < $scope.activityGroups.length; i++) {
                            $scope.activityGroups[i].left = 0;
                            if ($scope.activityGroups[i].selected)
                                break;
                        }

                        i++;
                        for (i; i < $scope.activityGroups.length; i++) {
                            $scope.activityGroups[i].left = ($window.innerWidth + 40);
                        }
                        $scope.resultLeft = $window.innerWidth - 40;
                    }
                    break;
                case 'partial-results':
                    if ($scope.isPhonePortrait) {
                        $scope.resultLeft = $window.innerWidth - 170;
                    }
                    break;
                case 'results':
                    if (!$scope.isPhonePortrait) {
                        for (var i = 0; i < $scope.activityGroups.length - 1; i++) {
                            $scope.activityGroups[i + 1].left = 0;
                        }
                    }

                    $scope.resultLeft = 0;
                    break;
            }

            // calculate background image size

            var main = document.getElementById('main');

            if ($window.innerWidth / $window.innerHeight > 4896 / 3264) {
                main.classList.remove('portrait');
                main.classList.add('landscape');
            } else {
                main.classList.remove('landscape');
                main.classList.add('portrait');
            }
        }

        // skip this for now
        if (false && $scope.isPhonePortrait) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('')
                .content('Your device screen is too small; please turn to landscape mode or try the app on a computer or tablet for a better user experience.')
                .ok('Got it!')
            );
        } else {
            var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
            // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
            var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
            var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
            // At least Safari 3+: "[object HTMLElementConstructor]"
            var isChrome = !!window.chrome && !isOpera; // Chrome 1+
            var isIE = /*@cc_on!@*/ false || !!document.documentMode; // At least IE6

            /*if (!isSafari && !isChrome && !isFirefox) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('')
                    .content('We try to provide you the best experience.<br/><br/>This website currently works well in Chrome, Safari or Firefox. We recommend you viewing it in Chrome, Safari or Firefox.<br/><br/>They are great browsers! :)')
                    .ok('Got it!')
                );
            }*/
        }

        $(window).resize(function() {
            $scope.isPhonePortrait = $window.innerWidth <= 568;
            calculateColumnPositions();
            $scope.$digest();
        });

        $scope.selectedActivities = [];

        $scope.selectActivityGroup = function(activityGroup) {
            $scope.selectedActivityGroup = activityGroup;
            for (var i = 0; i < $scope.activityGroups.length; i++) {
                $scope.activityGroups[i].selected = false;
            }
            trackEvent('Activity: ' + activityGroup.type, 'Select activity group', activityGroup.desc);
            activityGroup.selected = true;
            calculateColumnPositions();
        };

        $scope.selectActivity = function(activity, activityGroup) {
            // do not allow selecting twice
            if (!activity.selected) {
                activity.selected = true;

                // if the same type of activity has been selected, remove it first
                for (var i = 0; i < $scope.selectedActivities.length; i++) {
                    if ($scope.selectedActivities[i].type == activity.type) {
                        $scope.selectedActivities[i].selected = false;
                        $scope.totalFootprint -= $scope.selectedActivities[i].footprint;
                        $scope.selectedActivities.splice(i, 1);

                        break;
                    }
                }

                trackEvent('Activity: ' + activity.type,
                    'Select activity',
                    activity.desc,
                    activity.footprint * 1000 //it seems Google Analytics has issue with decimal values so this is converted to KG from Tonne
                );

                $scope.selectedActivities.push(activity);
                $scope.totalFootprint += activity.footprint;
            }

            if (!activityGroup.completed) {
                activityGroup.completed = true;
                $scope.completedGroupsCount++;

                if ($scope.completedGroupsCount == $scope.activityGroups.length) {
                    $mdDialog.show({
                        controller: ResultProgressDialogController,
                        templateUrl: 'app/partials/resultProgressDialog.tmpl.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: false
                    });
                }
            }

            var self = $scope;

            function ResultProgressDialogController($scope, $mdDialog) {
                $scope.progress = 0;

                function increment() {
                    $scope.progress += 1;
                    $scope.$digest();
                    if ($scope.progress < 100)
                        setTimeout(increment, 50);
                    else {
                        $mdDialog.hide();
                        self.seeFullResults();
                    }
                }

                setTimeout(increment, 50);
            }

            if (activityGroup.arrayId < ($scope.activityGroups.length - 1) && !$scope.activityGroups[activityGroup.arrayId + 1].completed)
                $scope.doNextStep();
        };

        $scope.doNextStep = function() {
            var id = findSelectedActivityGroupId();
            if (id != null) {
                if (id < $scope.activityGroups.length - 1) {
                    $scope.selectActivityGroup($scope.activityGroups[id + 1]);
                }
            }
        };

        $scope.doPrevStep = function() {
            var id = findSelectedActivityGroupId();
            if (id != null) {
                if (id > 0) {
                    $scope.selectActivityGroup($scope.activityGroups[id - 1]);
                }
            }
        };

        var findSelectedActivityGroupId = function() {
            for (var i = 0; i < $scope.activityGroups.length; i++) {
                if ($scope.activityGroups[i].selected)
                    return i;
            }

            return null;
        };

        $scope.deselectActivity = function(activity) {
            for (var i = 0; i < $scope.selectedActivities.length; i++) {
                if ($scope.selectedActivities[i] === activity) {
                    $scope.selectedActivities.splice(i, 1);
                    break;
                }
            }

            activity.selected = false;

            $scope.totalFootprint -= activity.footprint;

            trackEvent('Activity: ' + activity.type, 'De-select activity', activity.desc, activity.footprint);

        };

        $scope.swipeLeft = function() {
            console.log('swipe');
        };

        $scope.start = function() {
            $scope.screenState = "calculating";

            dataPromise.then(function() {
                calculateColumnPositions();
            });

            setTimeout(function() {
                $scope.titleShown = false;
                $scope.$digest();
            }, 1000);

            trackEvent('Button', 'start');
        };

        $scope.seePartialResults = function() {
            $scope.screenState = "partial-results";
            calculateColumnPositions();
            trackEvent('Result', 'See partial result');
        }

        $scope.hidePartialResults = function() {
            $scope.screenState = "calculating";
            calculateColumnPositions();
            trackEvent('Result', 'Hide partial result');
        }

        $scope.seeFullResults = function() {

            if ($scope.completedGroupsCount == $scope.activityGroups.length) {
                $scope.screenState = "results";
                calculateColumnPositions();
            }
            trackEvent('Result', 'See full result', '', $scope.totalFootprint);
        }

        $scope.backToCalculation = function() {
            $scope.screenState = "calculating";
            calculateColumnPositions();
            trackEvent('Button', 'Back to calculation');
        }

        $scope.shareResults = function(ev) {
            var element = angular.element(document.getElementById("results"));

            trackEvent('Result', 'Share');

            FB.login(function(response) {
                checkLoginState(function(response) {
                    // get name
                    FB.api('/me', function(response) {
                        if (response.name) {
                            $scope.userFullName = response.name;
                            $scope.takingScreenshot = true;
                            $scope.$digest();
                            trackEvent('Login', 'UserId', response.id + ": " + response.name);
                        } else
                            console.error(response.error.message);

                        setTimeout(function() {
                            var w = document.documentElement.clientWidth;
                            var h = document.documentElement.clientHeight;
                            var canvas = document.createElement('canvas');
                            canvas.width = w * 2;
                            canvas.height = h * 2;
                            canvas.style.width = w + 'px';
                            canvas.style.height = h + 'px';
                            var context = canvas.getContext('2d');
                            context.scale(2, 2);

                            html2canvas(element, {
                                canvas: canvas
                            }).then(function(canvas) {
                                $scope.takingScreenshot = false;
                                $scope.$digest();

                                var imgData = canvas.toDataURL();

                                $mdDialog.show({
                                        controller: ShareDialogController,
                                        templateUrl: 'app/partials/shareDialog.tmpl.html',
                                        parent: angular.element(document.body),
                                        targetEvent: ev,
                                        clickOutsideToClose: true,
                                        locals: {
                                            fbImage: imgData
                                        }
                                    })
                                    .then(function(fbStatusMessage) {
                                        // login

                                        imgData = imgData.replace(/^data:image\/(png|jpe?g);base64,/, '');
                                        // convert the base64 string to string containing the binary data
                                        imgData = conversions.base64ToString(imgData);

                                        $mdDialog.show({
                                            controller: ProgressDialogController,
                                            templateUrl: 'app/partials/progressDialog.tmpl.html',
                                            parent: angular.element(document.body),
                                            /*targetEvent: ev,*/
                                            locals: {
                                                title: 'Sharing Image To Facebook...',
                                                message: 'Please do not close the window; it may takes a few seconds to a few minutes depending on your network connection.'
                                            }
                                        });

                                        postImage({
                                            fb: { // data to be sent to FB
                                                caption: fbStatusMessage,
                                                // place any other API params you wish to send. Ex: place / tags etc.
                                                accessToken: FB_ACCESS_TOKEN,
                                                file: {
                                                    name: 'File Name.jpg',
                                                    type: 'image/jpeg', // or png
                                                    dataString: imgData
                                                }
                                            },
                                            call: { // options of the $.ajax call
                                                url: 'https://graph.facebook.com/me/photos', // or replace *me* with albumid
                                                success: function() {
                                                    trackEvent('Result', 'Successfully shared', response.id + ": " + fbStatusMessage);
                                                    $mdDialog.show(
                                                        $mdDialog.alert()
                                                        .parent(angular.element(document.querySelector('#popupContainer')))
                                                        .clickOutsideToClose(true)
                                                        .title('Share successully.')
                                                        .content('The result has been shared to your facebook wall.')
                                                        .ok('Got it!')
                                                        .targetEvent(ev)
                                                    );
                                                },
                                                error: function() {
                                                    console.error('failed');
                                                }
                                            }
                                        });
                                    });
                            });
                        }, 500);
                    });
                }, function() {
                    // login failed
                });
            }, {
                scope: 'public_profile,email,user_friends,publish_actions'
            });

            function ShareDialogController($scope, $mdDialog, fbImage) {
                $scope.fbMessage = 'Check out my carbon footprint.\nCalculated via http://bit.ly/carbonsgsh';
                $scope.fbImage = fbImage;
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                $scope.answer = function(answer) {
                    $mdDialog.hide(answer);
                };
            }

            function ProgressDialogController($scope, $mdDialog, title, message) {
                $scope.title = title;
                $scope.message = message;
            }
        }

        $scope.showCredits = function() {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .content('<div>' + $sanitize($scope.settings.credits) +
                    '</div>'
                )
                .ok('Cool!')
            );
            trackEvent('Button', 'credit');
        };
    }
]);