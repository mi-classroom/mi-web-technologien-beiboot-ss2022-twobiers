# Hosting - GitHub Pages

## Status

Accepted

## Context

The application needs to be deployed somewhere.
Valid options are:
- [ADV Labor](http://www.gm.fh-koeln.de/advlabor/)
- Cloud Hosting provider like [Heroku](https://www.heroku.com/) or [Firebase](https://firebase.google.com/)
- Custom Hosting
- [GitHub Pages](https://pages.github.com/)

## Decision

Because GitHub Pages is fairly easy to use and brings everything that is necessary for this project it is used to deploy the application.

## Consequences

Pros: 
* Easy and free to use
* Fast deployment with automated workflows
* Less complexity than managing a webserver on own
* Nearly configuration-less - enables forking of the repository and further development

Cons:
* Not a fully-fledged-webserver
* Soft bandwith limit of 100GB/month
* Soft buld limit of 10 builds/hour