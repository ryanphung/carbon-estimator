# Carbon Estimator

Hello!

To limit climate change to 2℃, globally we must emit no more than 565 gigatons of carbon this century. It is our hope this tool helps people reduce their carbon footprints to make a sustainable future possible.

We believe this is the most intuitive and fastest carbon estimator available that works on both desktop and mobile devices.

Feel free to customise and install it on your own website, and help to spread to as many people as possible!  

## Demo

Try this working demo that was built for Singapore: http://whatismycarbonfootprint.com/sg

The data is publicly available here: https://drive.google.com/open?id=1QC1qEfeDZdGcd0d5Bv7WQSwonSQvnjSDmxN2BrZOFOE

## Installation

1. Requirements: [node.js, npm](http://nodejs.org/), [bower](http://bower.io/), [git](http://git-scm.org/) and a simple [web server](http://www.apachefriends.org).
1. [Clone the repository](https://help.github.com/articles/cloning-a-repository/)
1. From the main directory, run `bower install` to install the dependencies
1. Copy the entire directory to a directory that your web server can serve, for example `htdocs/carbon-estimator`
1. Access the Carbon Estimator at http://your_domain/carbon-estimator

## Customisation

The tool relies on a single Google sheet for all its configuration. To create your own customisation:

1. Duplicate the sample [Google sheet](https://drive.google.com/open?id=1NoSg0Sj_ZCcoYfZXMGxP0hcvFtipKUGZ5r0e6xPMrX0).
1. Publish your new Google sheet: Google Sheet menu > File > Publish to the web. You'll get a link that look similar to this: `https://docs.google.com/spreadsheets/d/1NoSg0Sj_ZCcoYfZXMGxP0hcvFtipKUGZ5r0e6xPMrX0/pubhtml`
1. Copy and paste the ID part of the URL (`1NoSg0Sj_ZCcoYfZXMGxP0hcvFtipKUGZ5r0e6xPMrX0`) into the file `app/server.js` and replace the ID on this line:

        const configGoogleSheetId = '1NoSg0Sj_ZCcoYfZXMGxP0hcvFtipKUGZ5r0e6xPMrX0'

1. Now you can start modifying the configuration in the Google sheet according to your need, the modification will be available in the carbon estimator in a few minutes.

## Facebook Sharing

To update title, description and thumbnail to display when the page link is shared on Facebook:

1. Open `index.html` for edit.
1. Look for `<meta property="og:` and update the content of the <meta> tags.
1. Look for `<meta property="fb:` and update the Facebook Application ID. If you do not have one, you can leave the current content there or remove the entire line.

To enable Facebook Share button in the page is a bit more complicated and you'll need to get Facebook approval.

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
