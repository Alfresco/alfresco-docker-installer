# generator-alfresco-docker-installer
> Alfresco Docker Installer

Since Alfresco Installer was discontinued from Alfresco 5.2, this project provides a command line installer for Alfresco Community 6.1 to be used in Docker Compose installations.

This project generates a Docker Compose template ready to be used including following features:

* RAM limits for every service according to global memory available for Docker
* PostgreSQL or MariaDB as database (no other option but MySQL is supported for Community)
* Search Services configured for environments using several languages for contents or from operative systems / browsers
* Outbound Email service (smtp)
* LDAP service for identification (based in OpenLDAP)
* Several addons available

## Installation

This program has following dependencies:

* Node.js
* Yeoman

You can download and install `Node.js` from official web page:

https://nodejs.org/en/download/

Or you can use any of the package managers provided by the product:

https://nodejs.org/en/download/package-manager/

Once Node.js is installed, you can install [Yeoman](http://yeoman.io) as a module:

```bash
$ npm install -g yo
```

Deployment is provided for Docker Compose, so following dependencies must be satisfied by the server used to run the generated configuration:

* Docker
* Docker Compose


## Configuring options

```
? Which Alfresco version do you want to use? 6.1
? How may GB RAM are available for Alfresco (8 is minimum required)? 8
? Do you want to use MariaDB instead of PostgreSQL? No
? Are you using different languages (this is the most common scenario)? Yes
? Do you want to create an internal SMTP server? No
? Do you want to create an internal LDAP server? No
? Select the addons to be installed:
  JavaScript Console 0.6
  Order of the Bee Support Tools 1.0.0.0
  Share Site Creators 0.0.7
  Simple OCR 2.3.1
  ESign Cert 1.8.2
```

## Passing parameters from command line

Default values for options can be specified in the command line, using a `--name=value` pattern. When an options is specified in the command line, the question is not prompted to the user, so you can generate a Docker Compose template with no user interaction.

```
$ yo alfresco-docker-compose --acsVersion=6.1
```

**Parameter names reference**

`--acsVersion`: currently only accepting 6.1
`--ram`: number of GB available for Docker
`--mariadb`: true or false
`--crossLocale`: true or false
`--smtp`: true or false
`--ldap`: true or false
`--addons`: list of addons to be installed: js-console, ootbee-support-tools, share-site-creators, simple-ocr, esign-cert


## Using Docker Compose

Once the files have been generated, just start Docker Compose.

```
$ docker-compose up --build --force-recreate
```

You can shutdown it at any moment using following command.

```
$ docker-compose down
```

**URLs**

*HTTP*

http://localhost

http://localhost/share

http://localhost/alfresco

http://localhost/solr
