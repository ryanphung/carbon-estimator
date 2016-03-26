# Carbon Estimator

Hello!

To limit climate change to 3.5℃, globally we must emit no more than 350 gigatons of carbon this century. It is our hope this tool helps people reduce their carbon footprints to make a sustainable future possible.

We believe this is the most intuitive and fastest carbon estimator available that works on both desktop and mobile devices.

Feel free to customise and install it on your own website, and help to spread to as many people as possible!  

## Demo

Try this working demo that was built for Singapore: http://climaterealityproject.asia/calculator

The data is publicly available here: https://docs.google.com/spreadsheets/d/18k_xx-K2UyOLkZUz3C-qf840aNaab1B6xElDdszeMS8/

## Installation

1. Requirements: [node.js, npm](http://nodejs.org/), [bower](http://bower.io/), [git](http://git-scm.org/) and a simple [web server](http://www.apachefriends.org).
1. [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
1. From the main directory, run `bower install` to install the dependencies
1. Copy the entire directory to a directory that your web server can serve, for example `htdocs/carbon-estimator`
1. Access the Carbon Estimator at http://your_domain/carbon-estimator

## Customisation

The tool relies on a single Google sheet for all its configuration. To create your own customisation:

1. Duplicate the sample [Google sheet](https://docs.google.com/spreadsheets/d/18k_xx-K2UyOLkZUz3C-qf840aNaab1B6xElDdszeMS8/).
1. Publish your new Google sheet: Google Sheet menu > File > Publish to the web. You'll get a link that look similar to this: `https://docs.google.com/spreadsheets/d/18k_xx-K2UyOLkZUz3C-qf840aNaab1B6xElDdszeMS8/pubhtml`
1. Copy and paste the link into the file `app/router.js` at this part:

        ...
        $tabletopProvider.setTabletopOptions({
            key: "https://docs.google.com/spreadsheets/d/18k_xx-K2UyOLkZUz3C-qf840aNaab1B6xElDdszeMS8/pubhtml",
            prettyColumnNames: false,
            parseNumbers: true
        });
        ...

1. Now you can start modifying the configuration in the Google sheet according to your need, the modification will be available in the carbon estimator in a few minutes.

## Facebook Sharing

To enable Facebook sharing is a bit more complicated and you'll need to get Facebook approval.

1. Create a [Facebook app](https://developers.facebook.com/docs/apps/register).
1. Make sure that the site URL matches your website, for example: http://climaterealityproject.asia/calculator - otherwise user will not be able to authenticate to Facebook from your website.
1. Once you created the app, you'll have a unique app ID. Go to Google sheet, tab `Settings`, paste it into the field `facebookAppId`.
1. [Submit](https://developers.facebook.com/docs/apps/review) your app for review. It takes a few days but here are a few tips to speed up the process:
    * Add as much details and screenshots as you can.
    * Be clear in all your description.
    * Suggest that you replace this line in `app/controllers/mainController.js`:
        
            $scope.fbMessage = 'Check out my carbon footprint.\nCalculated via http://bit.ly/carbonsgsh';
        
        with

            $scope.fbMessage = '';

## Current Usage

* [Climate Reality Project Asia, Singapore](http://climaterealityproject.asia/)

Drop us a note at hello@whatismycarbonfootprint.com if you want your website to be listed here.

Have fun!
