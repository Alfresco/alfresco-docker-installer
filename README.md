# generator-alfresco-docker-installer
> Alfresco Docker Installer

[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker Compose](https://img.shields.io/badge/docker%20compose-v2-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![ACS 6.1-26.1](https://img.shields.io/badge/ACS-6.1--26.1-0A6EBD)](https://github.com/Alfresco/alfresco-docker-installer)
[![License: LGPL v3+](https://img.shields.io/badge/license-LGPL%20v3%2B-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0.html)

## Table of Contents

- [DISCLAIMER](#disclaimer)
- [Description](#description)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running](#running)
- [Passing parameters from command line](#passing-parameters-from-command-line)
- [Deploying additional addons](#deploying-additional-addons)
- [Using Docker Compose](#using-docker-compose)
- [Docker Volumes](#docker-volumes)
- [Docker Images](#docker-images)
- [Service URLs](#service-urls)
- [Traefik Dashboard](#traefik-dashboard-acs-261-when-using-traefik-proxy)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)
- [Upgrading and Migration](#upgrading-and-migration)
- [Building](#building)

## Description

Since Alfresco Installer was discontinued from Alfresco 5.2, this project provides a command line installer for Alfresco Community 6.1, 6.2, 7.x, 23.x, 25.x and 26.x to be used in Docker Compose installations.

This project generates a Docker Compose template ready to be used including the following features:

* Memory limits for every service according to global memory available for Docker (using modern Docker Compose syntax)
* Proxy selection: Choose between nginx (traditional) or Traefik (modern, label-based routing) for ACS 26.1
* The project supports PostgreSQL and MariaDB as databases, but MySQL can also be used for the Community edition.
* Search Services configured for environments using several languages for contents or from operative systems / browsers
* Outbound Email service (smtp)
* LDAP service for identification (based in OpenLDAP)
* Several Community addons available
* Wrapper Script for waiting the alfresco boot to finish

>> This generator creates a base Docker Template with the configuration selected, but you should review volumes, configuration, modules & tuning parameters before using this composition in Production environments.

**WARNING** Depending on the OS used for hosting Docker, some adjustments must be made in default **volumes** configuration:

* For *Mac OS*, produced Docker Compose template should work as is
* For *Windows*, a safer approach is to use standard [Docker Volumes](https://docs.docker.com/storage/volumes/) instead of [Bind Docker Volumes](https://docs.docker.com/storage/bind-mounts/). This alternative is enabled when choosing "Windows host" option in the generator.
* For *Linux*, some local folder permission must be adjusted if you are not using 'root' to run Docker. Review the [Docker Volumes](https://github.com/Alfresco/alfresco-docker-installer#docker-volumes) section before running the produced Docker Compose template. Also checkout this tutorial with video recording on how to use this tool in Ubuntu 20.04 LTS: [Installing Alfresco 6 Community Edition in Ubuntu](https://hub.alfresco.com/t5/alfresco-content-services-blog/installing-alfresco-6-community-edition-in-ubuntu-using-docker/ba-p/303840)

## Quick Start

Get up and running with Alfresco in 5 minutes:

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- At least 16GB RAM available for Docker

### Steps

1. Install the generator
   ```bash
   npm install -g yo generator-alfresco-docker-installer
   ```

2. Create a deployment directory
   ```bash
   mkdir alfresco-docker
   cd alfresco-docker
   ```

3. Run the generator
   ```bash
   yo alfresco-docker-installer
   ```
   
   Accept the defaults or customize as needed. For a quick test, use:
   - ACS Version: 26.1 (latest)
   - RAM: 16 GB (minimum)
   - HTTPS: No (for quick testing)
   - Proxy: nginx (traditional, default)
   - Keep other defaults as-is

4. Start Alfresco
   ```bash
   docker compose up -d
   ```

5. Wait for services to start (2-3 minutes)
   ```bash
   docker compose logs -f alfresco
   ```
   Look for: "Server startup in [XXXX] milliseconds"

6. Access Alfresco
   - Content App: http://localhost/
   - Share UI: http://localhost/share
   - Repository: http://localhost/alfresco
   - Login: `admin` / `admin` (by default)

7. Stop when done
   ```bash
   docker compose down
   ```

For detailed configuration options, see the sections below.

## Prerequisites

Before installing the generator, ensure your system meets these requirements

### System Requirements

Hardware

- Minimum 16GB RAM available for Docker (12GB usable for very light deployments)
- 50GB+ free disk space for Docker images and Alfresco data
- Multi-core CPU recommended (4+ cores)

Software

- Node.js: Version 18 or higher (required for ES module support)
- Docker: Docker Engine 20.10+ or Docker Desktop
- Docker Compose: V2 (plugin syntax: `docker compose`) or V1 (standalone: `docker-compose`)
- Yeoman: Installed via npm

Operating System

- Linux (Ubuntu, CentOS, RHEL, Debian, etc.)
- macOS (Intel or Apple Silicon with AARCH64 images for ACS 7.3+)
- Windows 10/11 with WSL2 (recommended) or Hyper-V

### Important Notes

- **Production Warning**: This tool is designed for development, testing, and POC environments. For production deployments, review and customize the generated configuration thoroughly.
- **Docker Resources**: Ensure Docker has access to sufficient memory (16GB+) in Docker Desktop settings (macOS/Windows).
- **Linux Users**: You may need to adjust folder permissions for Docker volumes (see [Docker Volumes](#docker-volumes) section).
- **Windows Users**: Using Docker volumes (not bind mounts) is recommended for better compatibility.

## Installation

Once prerequisites are met, install the required dependencies:

You can download and install `Node.js` from official web page:

https://nodejs.org/en/download/

Or you can use any of the package managers provided by the product:

https://nodejs.org/en/download/package-manager/

Once Node.js is installed, you can install [Yeoman](http://yeoman.io) as a module:

```bash
npm install -g yo
```

And finally, you can install this generator:

```bash
npm install --global generator-alfresco-docker-installer
```

**Deployment**

Deployment is provided for Docker Compose, so following dependencies must be satisfied by the server used to run the generated configuration:

* Docker
* Docker Compose

You can install *Docker Desktop* for Windows or Mac and *Docker Server* for Linux.

https://docs.docker.com/get-docker/

You also need to add *Docker Compose* program to your installation.

https://docs.docker.com/compose/install/


## Running

Create a folder where Docker Compose template files are going to be produced and run the generator.

>>> If you downloaded this project, **don't** reuse source code folder. Create an empty folder to generate Docker Compose template anywhere.

```bash
mkdir docker-compose
cd docker-compose

yo alfresco-docker-installer
```

Several options are provided in order to build the configuration.

```
? Which ACS version do you want to use? 26.1
```

You can use Alfresco 6.1, 6.2, 7.0, 7.1, 7.2, 7.3, 7.4, 23.1, 23.2, 23.3, 23.4, 25.1, 25.2, 25.3 or 26.1

```
? Do you want to deploy Alfresco in ARCH64 computer (like Apple Silicon)?
```

Use ARCH64 Docker Images, mandatory when using Apple Silicon computers for deployment. This feature is only provided for ACS 7.3+

```
? How many GB RAM are available for Alfresco (16 is minimum required)? 16
```

Alfresco platform could work with less than 16 GB RAM, but it's recommended to provide at least 16 GB in your Docker server. This generator will limit the amount of memory for every service in order to match your resources.

```
? Do you want to use HTTPs for Web Proxy?
```

This option enables HTTPs for every service. Default SSL certificates (public and private) are provided in `config/cert` folder. These certificates are not recommended for prod environments, so it's required to replace these files with your own certificates.

```
? Which proxy would you like to use?
  nginx
  traefik
```

> **Note**: This prompt only appears when deploying ACS 26.1. For all previous ACS versions (6.x, 7.x, 23.x, 25.x), only nginx is available and no selection is prompted.

**Proxy Selection Guide** (ACS 26.1 only):

- **nginx** (Default): Traditional, file-based configuration using `nginx.conf`. Battle-tested and widely used.
  - + Proven reliability and performance
  - + Extensive documentation and community support
  - + Familiar to most system administrators
  - ! Static configuration requires container restart for changes
  
- **Traefik**: Modern approach using Docker labels for automatic service discovery and routing.
  - + Dynamic configuration via Docker labels (no restarts needed)
  - + Built-in dashboard on port 8888 for monitoring
  - + Automatic service discovery and health checks
  - + Modern middleware support (redirects, authentication, rate limiting)
  - + Uses the mounted Docker socket (`/var/run/docker.sock`) like `acs-deployment`
  - ! Newer technology, smaller community than nginx

Both proxies support HTTP and HTTPS protocols with equivalent functionality. Choose based on your preference and operational requirements.

> **Note**: For ACS 26.1, Traefik now follows the same Docker provider model used by `acs-deployment`: it mounts `/var/run/docker.sock` and connects through the Unix socket on macOS, Linux and Windows Docker Desktop/WSL2.

```
? What is the name of your server?
```

If you are deploying on a server different than `localhost`, include in this option the name of your server. For instance: `alfresco.com`

```
? Choose the password for your admin user (admin)
```

Alfresco provides `admin` password by default, choose a different one for new deployments. When using this option on pre-populated Alfresco Repositories, this setting is not applied, since the password is already stored in the existent database. By default `system.preferred.password.encoding` is using `bcrypt10` algorithm, so passwords are stored in database ciphered with salt.

```
? What HTTP port do you want to use (all the services are using the same port)? 80 or 443
```

HTTP port to be used by every service. If you are running on a Linux computer, you'll need to specify a port greater than 1024 when not starting as `root` user.

```
? Do you want to specify a custom binding IP for HTTP? No
```

If you choose 'No', the default binding IP (0.0.0.0) will be used, allowing the HTTP service to accept requests from all network interfaces on the server. Selecting 'No' is suitable for most configurations where no specific network restrictions are required.

```
? Do you want to use FTP (port 2121)? No
```

Enable configuration for FTP, using by default port 2121.

```
? Do you want to specify a custom binding IP for FTP? No
```

This controls the FTP service binding IP (same concept as HTTP binding above). Default (0.0.0.0) listens on all interfaces.

```
? Do you want to use MariaDB instead of PostgreSQL? No
```

Alfresco uses PostgreSQL by default, but alternatively `MariaDB` can be used as database.

```
? Are you using different languages (this is the most common scenario)? Yes
```

By default, many organizations are storing documents in different languages or the users are accessing the platform with browsers configured in different languages. If this is your case, enable this configuration.

```
? Do you want to search in the content of the documents?
```

By default, Alfresco is indexing the content of a document (in addition to the metadata). Disable this option if you don't require searching by the content of the documents.

```
? Which search engine would you like to use?
  Alfresco Search Services (stock, Solr 6)
  Jeci community fork (vanilla Solr 9 / Java 17, standalone trackers)
```

This question is **only available for ACS 26.1**. By default the stock **Alfresco Search Services** image (Apache Solr 6) is used.

The **Jeci community fork** ([jecicorp/AlfrescoSearchServices](https://github.com/jecicorp/AlfrescoSearchServices)) runs search on **vanilla Apache Solr 9 / Java 17** and splits the search tier into **two services**: `solr6` (query serving + index storage) and `trackers` (the indexing trackers, externalized into a standalone Spring Boot service). The trackers can be re-tuned live through `ALFRESCO_TRACKER_*` environment variables without rebuilding any image.

Notes when selecting the Jeci fork:

* It is a **beta**, community-maintained fork — not affiliated with Hyland and not recommended for production yet.
* Communication with the Repository is forced to **shared secret** (the `Alfresco-SOLR communication` question below is skipped); the fork does not yet support mTLS on the trackers → Solr leg.
* The images are **not published to a public registry** yet, so build them locally and point `SEARCH_JECI_IMAGE` / `TRACKERS_JECI_IMAGE` in `.env` at your local tags (defaults: `alfresco/alfresco-search-services:local` and `alfresco/alfresco-indexing-trackers:local`).
* A full re-index is required (Lucene 9 cannot read a Solr 6 index); start with empty cores and let the trackers rebuild from the Repository.

```
? Would you like to use HTTP or Shared Secret for Alfresco-SOLR communication?
  http  << Not available when using ACS 7.2+
  https
  secret
```

By default, communication between Alfresco and SOLR happens in plain `http`. Since external APIs are protected by `proxy` and SOLR Web Console is protected by user and password, default configuration may be the right one for many deployments. **This option has been disabled from ACS 7.2!**

When using `secret` option (only available from 7.1.0), Alfresco and SOLR communication is happening in plain HTTP but including a shared secret word in HTTP Header. This should be a safer approach for open environments.

In addition, when using `https` option, communication between SOLR and Alfresco is using Mutual TLS. This protocol includes client authentication using digital certificates, that may be also a safe alternative.

```
? Do you want to use the Events service (ActiveMQ)? No
```

This question is only available from ACS 7.3+. ActiveMQ for Community Edition is only required when using Out-Of-Process SDK, it may be omitted for other use cases.

```
? Do you want to use credentials for Events service (ActiveMQ)? No
```

By default, there is no authentication for ActiveMQ service on older ACS releases. When choosing `Yes` for this option, you'll be prompted for username and password to be used to access ActiveMQ Alfresco Broker. Starting with ACS 26.1, the broker image requires credentials, so the generator will always ask for username and password when Events service is enabled. In all cases, remember to use these credentials to consume messages from ActiveMQ when using Out of Process SDK or similar.

```
? Do you want to create an internal SMTP server? No
```

This service provides an internal SMTP server (for outgoing emails) based in a Postfix Relay. If you want to use your own mail server, you can configure it manually after the generation of the Docker Compose template.

```
? Do you want to create an internal LDAP server? No
```

This service provides an internal OpenLDAP server (for authentication). If you want to use your own LDAP or AD server, you can configure it manually after the generation of the Docker Compose template.

```
? Select the addons to be installed:
  Google Docs 3.0.3                             : https://github.com/Alfresco/google-docs/tree/V3.0.3
  JavaScript Console 0.7                        : https://github.com/AFaust/js-console
  Order of the Bee Support Tools 1.2.2.0        : https://github.com/OrderOfTheBee/ootbee-support-tools
  Share Site Creators 0.0.8                     : https://github.com/aborroy/share-site-creators
  Share Site Space Templates 1.1.4-SNAPSHOT     : https://github.com/jpotts/share-site-space-templates
  Simple OCR 2.3.1 (for ACS 6.x)                : https://github.com/keensoft/alfresco-simple-ocr
  Alfresco OCR Transformer 1.0.0 (for ACS 7+)   : https://github.com/aborroy/alf-tengine-ocr
  ESign Cert 1.8.4                              : https://github.com/ambientelivre/alfresco-esign-cert
  Edit with LibreOffice in Alfresco Share 0.3.0 : https://github.com/zylklab/alfresco-share-online-edition-addon
  Alfresco PDF Toolkit 1.4.x                    : https://github.com/OrderOfTheBee/alfresco-pdf-toolkit
```

A small catalog of trusted *addons* is provided by default, but you can install any other using the deployment folders.

```
? Do you want Docker to manage volume storage (recommended when dealing with permission issues)?
```

Standard [Docker Volumes](https://docs.docker.com/storage/volumes/) can be used instead of [Bind Docker Volumes](https://docs.docker.com/storage/bind-mounts/). This option is easier to run in environments with folder permission issues.

```
? Do you want to use a start script? Yes
```

The wrapper script for the docker-compose file allows nice features as a wait for alfresco to finish the boot and much more. Use "./start.sh -h" for more information.

```
? Do you want to get the script to create host volumes? No
```

When using Linux as host, you can get the script `create_volumes.sh` in Docker Compose folder. The script should be run only once, and be the first one to be executed, before the docker-compose up command, to create the initial `data` and `logs` host folders with the expected permissions. 


## Passing parameters from command line

Default values for options can be specified in the command line, using a `--name=value` pattern. When an option is specified in the command line, the question is not prompted to the user, so you can generate a Docker Compose template with no user interaction.

```
$ yo alfresco-docker-installer --acsVersion=6.1
```

**Parameter names reference**

* `--acsVersion`: 6.1, 6.2, 7.0, 7.1, 7.2, 7.3, 7.4, 23.1, 23.2, 23.3, 23.4, 25.1, 25.2, 25.3 or 26.1
* `--arch`: true or false (use ARCH64 Docker Images for Apple Silicon, ACS 7.3+ only)
* `--ram`: number of GB available for Docker
* `--https`: true or false
* `--proxyType`: nginx or traefik (only for ACS 26.1, defaults to nginx)
* `--serverName`: localhost default
* `--password`: admin user default password
* `--port`: 80 default (443 for HTTPS)
* `--configureHttpIp`: true or false (custom binding IP for HTTP)
* `--ftp`: true or false
* `--mariadb`: true or false
* `--crossLocale`: true or false
* `--enableContentIndexing`: true or false
* `--searchType`: alfresco or jeci (only for ACS 26.1, defaults to alfresco; `jeci` forces `--solrHttpMode=secret`)
* `--solrHttpMode`: http, https or secret
* `--activemq`: true or false (ACS 7.3+)
* `--smtp`: true or false
* `--ldap`: true or false
* `--addons`: list of addons to be installed: js-console, ootbee-support-tools, share-site-creators, simple-ocr, alf-tengine-ocr, esign-cert
* `--windows`: true or false (use Docker volumes instead of bind mounts)
* `--startscript`: true or false
* `--volumesscript`: true or false

**Example with Traefik:**

```bash
yo alfresco-docker-installer \
  --acsVersion=26.1 \
  --proxyType=traefik \
  --https=true \
  --serverName=alfresco.example.com \
  --port=443
```

**Example with the Jeci Solr 9 community fork (ACS 26.1 only):**

```bash
yo alfresco-docker-installer \
  --acsVersion=26.1 \
  --searchType=jeci \
  --ram=16 \
  --serverName=localhost \
  --port=80
```

Before `docker compose up`, build the fork's images locally (they are not published to a public registry yet) and, if you tagged them differently, set `SEARCH_JECI_IMAGE` / `TRACKERS_JECI_IMAGE` in the generated `.env`:

```bash
git clone https://github.com/jecicorp/AlfrescoSearchServices.git
cd AlfrescoSearchServices
mise run install && mise run trackers:build
docker build -t alfresco/alfresco-search-services:local search-services/packaging/target/docker-resources/
docker build -t alfresco/alfresco-indexing-trackers:local \
  -f search-services/packaging/src/docker/Dockerfile.trackers \
  search-services/alfresco-indexing-trackers/target/
```

**Note on boolean flags**: Yeoman treats boolean flags as true when present. To set a flag to true, include it (e.g., `--https`). To set it to false, omit the flag entirely. Do NOT use `--flag=false` syntax as it will be interpreted as true.

## Deploying additional addons

If you want to deploy additional addons, use deployment folders for Alfresco and Share services.

**Alfresco**

```
├── alfresco
│   ├── modules             > Deployment directory for addons
│   │   ├── amps            > Repository addons with AMP format
│   │   └── jars            > Repository addons with JAR format
```

**Share**

```
└── share                   
    └── modules             > Deployment directory for addons
        ├── amps            > Share addons with AMP format
        └── jars            > Share addons with JAR format
```

## Using Docker Compose

Once the files have been generated, review that configuration is what you expected and add or modify any other settings. After that, just start Docker Compose.

> **Note**: This documentation uses Docker Compose V2 syntax (`docker compose`). If you're using Docker Compose V1, replace `docker compose` with `docker-compose` (hyphenated).

```bash
docker compose up --build --force-recreate -d
```

You can shutdown it at any moment using the following command.

```bash
docker compose down
```

Alternatively if you choose to apply the start script, you can start the deployment with

```
./start.sh
```

It will wait until alfresco is reachable and shutdown with

```
./start.sh -d
```

More options are available with.

```
./start.sh -h
```

The generator creates the following project structure. Depending on the selected options, some optional paths may be omitted.

Runtime bind-mount folders under `data/` and `logs/` are typically created after `docker compose up` or by running `./create_volumes.sh` on Linux/macOS. When using the "Windows host" option, several of these paths are replaced by Docker volumes instead of local folders.

```
├── alfresco                > Repository image build context
│   ├── Dockerfile          > Docker image for Alfresco Repository
│   ├── modules             > Deployment directory for repository addons
│   │   ├── amps            > Repository addons with AMP format
│   │   └── jars            > Repository addons with JAR format
│   ├── bin                 > [OCR] Helper script to communicate with OCR service
│   └── ssh                 > [OCR] Shared key to communicate with OCR service

├── config                  > Proxy and access configuration
│   ├── nginx.conf          > NGINX configuration file
│   ├── nginx.htpasswd      > Password file protecting Solr Web Console access
│   └── cert                > [HTTPS] Self-signed certificate placeholders
│       ├── localhost.cer   > Public part of the SSL certificate
│       └── localhost.key   > Private part of the SSL certificate

├── data                    > Runtime bind-mount data (back this up when used)
│   ├── alf-repo-data       > Content store for Alfresco Repository
│   ├── activemq-data       > Message store for ActiveMQ
│   ├── ocr                 > [OCR] Shared OCR input/output folders
│   │   ├── input
│   │   └── output
│   ├── postgres-data       > Internal storage for PostgreSQL
│   ├── slapd               > [LDAP] OpenLDAP storage
│   │   ├── config
│   │   └── database
│   ├── solr-data           > Internal storage for Search Services
│   ├── solr-solrhome        > [searchType=jeci] Solr 9 cores/config (solrhome)
│   └── trackers-data        > [searchType=jeci] Standalone trackers model store

├── docker-compose.yml      > Main Docker Compose template
├── create_volumes.sh       > [Optional] Helper script to prepare Linux/macOS bind mounts

├── keystores               > [SOLR HTTPS] mTLS keystores for Repository and Search
│   ├── alfresco
│   ├── client
│   │   └── browser.p12
│   └── solr

├── logs                    > Runtime bind-mount logs
│   ├── alfresco            > Alfresco Repository logs
│   ├── postgres            > PostgreSQL logs
│   └── share               > Share web application logs

├── ocrmypdf                > [OCR] OCR service image build context
│   ├── Dockerfile          > Docker image for ocrmypdf
│   └── assets              > OCR service configuration assets

├── search                  > Search Services image build context (omitted when searchType=jeci, which uses prebuilt images)
│   └── Dockerfile          > Docker image for Search Services

├── share                   > Share image build context
│   ├── Dockerfile          > Docker image for Share
│   ├── modules             > Deployment directory for Share addons
│   │   ├── amps            > Share addons with AMP format
│   │   └── jars            > Share addons with JAR format
│   └── web-extension
│       └── share-config-custom-dev.xml

└── start.sh                > [Optional] Convenience script to start and stop the stack
```

## Docker Volumes

In order to enable persistent storage, several Docker Volumes are configured by default. When using from Linux, some permissions on your local folders need to be set.

>> You can skip all the following steps and have the volumes automatically configured by using the create_volumes.sh script optionally created during the project creation.

Identifying the right UID for every folder can be obtained by starting Docker Compose without the volumes declaration. Following lines should be commented in `docker-compose.yml` file.

```
    alfresco:
#        volumes:
#           - ./data/alf-repo-data:/usr/local/tomcat/alf_data
#           - ./logs/alfresco:/usr/local/tomcat/logs   

    postgres:
#        volumes:
#            - ./data/postgres-data:/var/lib/postgresql/data
#            - ./logs/postgres:/var/log/postgresql

    solr6:
#        volumes:
#            - ./data/solr-data:/opt/alfresco-search-services/data

    activemq:
#        volumes:
#            - activemq-data:/opt/activemq/data <% } %>

```

Once the volumes have been commented, start Docker Compose.

```
docker compose up --build --force-recreate
```

After that, you can find the SOLR Docker Image and the UID of the user owning data folders (`solr` by default).

```
$ docker ps
ded1748f961f    nginx:stable-alpine   tmp_proxy_1
b01e0abb3c0e    tmp_alfresco          tmp_alfresco_1
4fef719112ad    postgres:10.1         tmp_postgres_1
99a4bd6ede52    tmp_share             tmp_share_1
554236b9bedf    tmp_solr6             tmp_solr6_1

$ docker exec -it tmp_solr6_1 sh

$ cd /opt/alfresco-search-services/

$ ls -la
drwxr-xr-x 5 solr solr 4096 Nov 21 13:07 data

$ id -u solr
33007
```

Stop Docker Container and set the right permissions on your host folder.

```
docker compose down

$ sudo chown -R 33007 data/solr-data
```

You could need to adjust also the permissions for `postgres` user inside PostgreSQL Docker Image. By default the UID is 999, but you can perform similar operations as above to guess this number.

```
$ docker ps
ded1748f961f    nginx:stable-alpine   tmp_proxy_1
b01e0abb3c0e    tmp_alfresco          tmp_alfresco_1
4fef719112ad    postgres:10.1         tmp_postgres_1
99a4bd6ede52    tmp_share             tmp_share_1
554236b9bedf    tmp_solr6             tmp_solr6_1

$ docker exec -it tmp_postgres_1 sh

$ cd /var/lib/postgresql/

$ ls -la
drwx------ 19 postgres postgres 4096 Jul 24 14:05 data

$ id -u postgres
999

```

Stop Docker Container and set the right permissions on your host folder.

```
$ sudo chown -R 999 data/postgres-data
$ sudo chown -R 999 logs/postgres
```

Additionally, permissions for `alfresco` user inside Alfresco Docker Image may be adjusted.

```
$ docker ps
ded1748f961f    nginx:stable-alpine   tmp_proxy_1
b01e0abb3c0e    tmp_alfresco          tmp_alfresco_1
4fef719112ad    postgres:10.1         tmp_postgres_1
99a4bd6ede52    tmp_share             tmp_share_1
554236b9bedf    tmp_solr6             tmp_solr6_1

$ docker exec -it tmp_alfresco_1 sh

$ ls -la alf_data
drwx------ 19 alfresco alfresco 4096 Jul 24 14:05 alf_data

$ id -u alfresco
33000
```

Stop Docker Container and set the right permissions on your host folder.

```
$ sudo chown -R 33000 data/alf-repo-data
$ sudo chown -R 33000 logs/alfresco
```

Finally, you may set the right permissions for `activemq` Docker Image by using following commands:

```
$ mkdir -p ./data/activemq-data
$ sudo chown -R 33031 data/activemq-data
```

Uncomment the lines in your `docker-compose.yml` for the volumes declaration and your Docker Compose should be ready to use.

**Windows volumes**

When using Windows, standard [Docker Volumes](https://docs.docker.com/storage/volumes/) can be used instead of [Bind Docker Volumes](https://docs.docker.com/storage/bind-mounts/).

For instance, for an installation in a folder named `tmp`, following volumes are created.

```
$ docker volume ls --filter name=tmp_
DRIVER              VOLUME NAME
local               tmp_alf-repo-data
local               tmp_alf-repo-logs
local               tmp_alf-share-logs
local               tmp_postgres-data
local               tmp_postgres-logs
local               tmp_solr-data
```

You need to take care of this volumes for backup and other operations.

In case you want to clean your environment (loosing all the data inside), you can remove all this Docker containers to start from scratch.

For instance, for an installation in a folder name `tmp`, following command will **remove** all the information persisted.

```
$ docker volume rm $(docker volume ls -q --filter name=tmp_)
```

## Docker Images

* [alfresco-content-repository-community](https://hub.docker.com/r/alfresco/alfresco-content-repository-community)
* [alfresco-share](https://hub.docker.com/r/alfresco/alfresco-share)
* [alfresco-search-services](https://hub.docker.com/r/alfresco/alfresco-search-services)
* [postgres](https://hub.docker.com/_/postgres)
* [nginx:stable-alpine](https://hub.docker.com/_/nginx) - Traditional reverse proxy
* [traefik:3.6](https://hub.docker.com/_/traefik) - Modern reverse proxy (ACS 26.1+)
* [mwader/postfix-relay](https://hub.docker.com/r/mwader/postfix-relay)
* [osixia/openldap](https://hub.docker.com/r/osixia/openldap)
* [osixia/phpldapadmin](https://hub.docker.com/r/osixia/phpldapadmin)
* [jbarlow83/ocrmypdf:latest](https://hub.docker.com/r/jbarlow83/ocrmypdf)
* [angelborroy/alfresco-tengine-ocr](https://hub.docker.com/repository/docker/angelborroy/alfresco-tengine-ocr)

## Service URLs

These are default URLs, selecting HTTP port 80.

* If you selected a different port (for instance 8080), the services will be available in http://localhost:8080.

* If you selected `https`, the services will be available in https://localhost

* If you included a different server name from `localhost` (for instance `alfresco.com`), the services will be available in http://alfresco.com or https://alfresco.com

*Default URLs*

http://localhost

Default credentials
* user: admin
* password: admin (or chosen password)

http://localhost/share

Default credentials
* user: admin
* password: admin (or chosen password)

http://localhost/alfresco

Default credentials
* user: admin
* password: admin (or chosen password)

http://localhost/solr

Default credentials
* user: admin
* password: admin

http://localhost/api-explorer

Default credentials
* user: admin
* password: admin (or chosen password)

http://localhost:8161

Default credentials: none (or the username and password chosen)

http://localhost:8088

Default credentials
* user: cn=admin,dc=alfresco,dc=org
* password: admin

## Traefik Dashboard (ACS 26.1+ when using Traefik proxy)

When selecting Traefik as the proxy, an additional dashboard is available for monitoring and managing routing:

http://localhost:8888

This dashboard provides

* Real-time view of all configured services and routers
* HTTP request metrics and statistics
* Health check status for all services
* Middleware configuration details
* TLS certificate information

**Note**: The dashboard runs in insecure mode for development convenience. In production environments, you should either

1. Secure the dashboard with authentication
2. Disable the dashboard completely
3. Restrict access via firewall rules

Traefik Features

* Dynamic service discovery via Docker labels
* Automatic routing configuration
* Built-in health checks and monitoring
* Support for HTTP and HTTPS with automatic TLS
* Middleware support (authentication, rate limiting, redirects)
* No configuration file reloads needed - changes are automatic

## Troubleshooting

### Common Issues and Solutions

#### Port Already in Use

**Problem**: Error starting services: "port is already allocated"

**Solution**:
```bash
# Find what's using the port (e.g., port 80)
sudo lsof -i :80

# Stop the conflicting service or change the port in the generator
# When running the generator, specify a different port:
yo alfresco-docker-installer --port=8080
```

#### Permission Denied Errors (Linux)

**Problem**: Cannot write to data folders or "Permission denied" errors

**Solution**:
1. Use the `create_volumes.sh` script (if generated):
   ```bash
   chmod +x create_volumes.sh
   ./create_volumes.sh
   ```

2. Or manually set permissions (see [Docker Volumes](#docker-volumes) section for detailed UID instructions)

3. Alternative: Use Docker-managed volumes:
   ```bash
   yo alfresco-docker-installer --windows=true
   ```

#### Out of Memory Errors

**Problem**: Services crash or become unresponsive

**Solution**:
1. Check Docker memory allocation:
   ```bash
   docker system info | grep Memory
   ```

2. Increase Docker memory (Docker Desktop: Settings → Resources → Memory)

3. Minimum requirement: 16GB RAM

4. Close other applications to free up memory

#### Services Won't Start / Timeout

**Problem**: Alfresco takes too long to start or fails to start

**Solution**:
1. Check logs:
   ```bash
   docker compose logs alfresco
   docker compose logs postgres
   docker compose logs solr6
   ```

2. Common causes:
   - Insufficient memory (increase Docker memory limit)
   - Database not ready (wait longer, check postgres logs)
   - Port conflicts (see "Port Already in Use" above)

3. Increase startup timeout:
   ```bash
   # In docker-compose.yml, increase healthcheck start_period
   # Or wait 5-10 minutes for first startup
   ```

#### Cannot Access Alfresco UI

**Problem**: Browser shows "Connection refused" or "Unable to connect"

**Solution**:
1. Verify services are running:
   ```bash
   docker compose ps
   ```

2. Check if proxy is healthy:
   ```bash
   docker compose logs proxy
   ```

3. Verify correct URL:
   - Default: http://localhost/ (port 80)
   - If you changed the port: http://localhost:YOUR_PORT/

4. Wait for startup to complete:
   ```bash
   docker compose logs -f alfresco | grep "Server startup"
   ```

#### SSL/Certificate Errors (HTTPS)

**Problem**: Browser shows certificate warnings

**Solution**:
1. For development: Accept the self-signed certificate warning

2. For production: Replace certificates in `config/cert/`:
   ```bash
   # Replace with your own certificates
   cp your-cert.pem config/cert/localhost.cer
   cp your-key.pem config/cert/localhost.key
   
   # Restart services
   docker compose restart proxy
   ```

#### Database Connection Errors

**Problem**: Alfresco logs show "Could not connect to database"

**Solution**:
1. Ensure database is healthy:
   ```bash
   docker compose ps postgres  # or mariadb
   docker compose logs postgres
   ```

2. Check database is ready:
   ```bash
   docker compose exec postgres pg_isready
   ```

3. Restart database and alfresco:
   ```bash
   docker compose restart postgres alfresco
   ```

#### SOLR Not Indexing

**Problem**: Search doesn't return results, SOLR console shows no documents

**Solution**:
1. Check SOLR communication:
   ```bash
   docker compose logs solr6 | grep ERROR
   docker compose logs alfresco | grep solr
   ```

2. Verify SOLR is accessible from Alfresco:
   ```bash
   docker compose exec alfresco curl -s http://solr6:8983/solr/
   ```

3. Check SOLR tracking status in Alfresco Admin Console:
   - Go to: http://localhost/alfresco/s/admin/admin-searchservice
   - Look for connection status and tracking state

#### Traefik Not Discovering Services

**Problem**: Traefik shows "Failed to retrieve information of the docker client and server host" error, or services return 404 errors through the proxy.

**Cause**: The generated deployment is using an outdated Traefik configuration. The most common symptoms are:

- Traefik image older than `3.6`
- Docker provider endpoint set to `tcp://host.docker.internal:2375`
- Missing `/var/run/docker.sock` mount in the `proxy` service

**Solution**:

1. **Ensure correct configuration during generation**:

   Regenerate with the current generator:
   ```bash
   yo alfresco-docker-installer \
     --acsVersion=26.1 \
     --proxyType=traefik
   ```

2. **Verify docker-compose.yml configuration**:

   Check that Traefik uses the Unix socket and Traefik `3.6`:
   ```bash
   grep -E "traefik:|providers.docker.endpoint|docker.sock" docker-compose.yml
   ```
   
   Should include:
   ```yaml
   image: traefik:3.6
   - "--providers.docker.endpoint=unix:///var/run/docker.sock"
   - /var/run/docker.sock:/var/run/docker.sock:ro
   ```

3. **If you have an older generated file**:

   Replace any `host.docker.internal:2375` endpoint with:
   ```yaml
   - "--providers.docker.endpoint=unix:///var/run/docker.sock"
   ```

   And ensure the `proxy` service mounts:
   ```yaml
   - /var/run/docker.sock:/var/run/docker.sock:ro
   ```

4. **Verify Traefik can connect**:
   ```bash
   # Check Traefik logs for connection errors
   docker compose logs proxy | grep -i "error\|failed"
   
   # Verify Traefik dashboard shows discovered services
   curl http://localhost:8888/api/http/routers | jq
   ```
   
   You should see routers for: alfresco, share, solr6, content-app

5. **Test service routing**:
   ```bash
   # Should return HTTP 302 (redirect) or 200, not 404
   curl -I http://localhost/alfresco
   curl -I http://localhost/share
   ```

**Alternative**: If you cannot resolve the issue, use nginx proxy instead:
```bash
yo alfresco-docker-installer --acsVersion=26.1 --proxyType=nginx
```

nginx works identically on all platforms without platform-specific configuration.

#### Node.js Installation Issues

**Problem**: Generator fails to install or run

**Solution**:
1. Verify Node.js version:
   ```bash
   node --version  # Should be 18.x or higher
   ```

2. Update Node.js if needed:
   - Download from: https://nodejs.org/
   - Or use nvm: `nvm install 18 && nvm use 18`

3. Clear npm cache and reinstall:
   ```bash
   npm cache clean --force
   npm install -g generator-alfresco-docker-installer
   ```

#### Docker Compose Version Issues

**Problem**: Commands fail with "unknown flag" or syntax errors

**Solution**:
1. Check Docker Compose version:
   ```bash
   docker compose version  # Should be V2
   ```

2. If using V1 (docker-compose), either:
   - Upgrade to V2: https://docs.docker.com/compose/install/
   - Or use hyphenated commands: `docker-compose` instead of `docker compose`

### Getting Help

If you continue to experience issues:

1. **Check existing issues**: https://github.com/Alfresco/alfresco-docker-installer/issues
2. **Review logs**: Always include relevant logs when reporting issues
3. **Provide details**: OS, Docker version, Node.js version, and exact error messages
4. **Official Alfresco resources**: https://github.com/Alfresco/acs-deployment

## Security Best Practices

### Essential Security Configurations

! **IMPORTANT**: The default configuration is designed for development and testing. Never use default settings in production without applying these security measures.

#### 1. Change Default Passwords

**Critical**: Change the default admin password:

```bash
# During generation, specify a strong password:
yo alfresco-docker-installer --password=YourStrongP@ssw0rd

# Or change in Alfresco Admin Console after deployment
```

Also secure

- Database passwords (in docker-compose.yml)
- SOLR console password (in nginx.htpasswd)
- ActiveMQ credentials (if enabled)

#### 2. Replace SSL Certificates

For production HTTPS deployments

```bash
# Generate or obtain valid SSL certificates
# Replace self-signed certificates:
cp your-domain.crt config/cert/localhost.cer
cp your-domain.key config/cert/localhost.key

# Set proper permissions
chmod 600 config/cert/localhost.key
chmod 644 config/cert/localhost.cer

# Restart proxy
docker compose restart proxy
```

#### 3. Network Security

Isolate services

- Use Docker networks (already configured in generated docker-compose.yml)
- Only expose necessary ports
- Consider using a firewall to restrict access

Binding IPs

```bash
# Bind to specific IP instead of 0.0.0.0 (all interfaces)
yo alfresco-docker-installer --configureHttpIp=true
# Then specify your server's IP address
```

#### 4. SOLR Protection

+ Already configured by the generator

- SOLR API endpoints are blocked by the proxy
- SOLR admin console requires authentication (nginx.htpasswd)

Additional recommendations

- Change SOLR console password in `config/nginx.htpasswd`
- Use HTTPS for SOLR communication in production:
  ```bash
  yo alfresco-docker-installer --solrHttpMode=https
  ```

#### 5. Data Protection

Backup strategy

```bash
# Regularly backup the data directory
tar -czf alfresco-backup-$(date +%Y%m%d).tar.gz data/

# Or use Docker volume backup for Windows deployments
docker run --rm -v alfresco_alf-repo-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/alf-data-backup.tar.gz /data
```

Encrypt sensitive data

- Use encrypted volumes for production data
- Encrypt backups before storing off-site
- Consider database encryption at rest

#### 6. ActiveMQ Security (if enabled)

**ACS 26.1+**: Credentials are mandatory

```bash
# Use strong credentials
yo alfresco-docker-installer --activemq=true \
  --activeMqUser=admin \
  --activeMqPassword=YourStrongP@ssw0rd
```

**Note**: Always use these credentials when connecting SDK applications

#### 7. Monitoring and Auditing

Enable monitoring

- Use Traefik dashboard (if using Traefik) for request monitoring
- Set up log aggregation (ELK, Splunk, etc.)
- Monitor resource usage: `docker stats`
- Enable Alfresco audit logging

Regular security audits

```bash
# Check for vulnerable images
docker scan alfresco

# Review access logs regularly
docker compose logs proxy | grep -E "40[0-9]|50[0-9]"
```

## Building

It's not required to build or download this project in order to use it. But this can be done using default *npm* tools.

The module is available at **npm**:

https://www.npmjs.com/package/generator-alfresco-docker-installer

If you want to build it locally, you need an environment with Node.js and Yeoman. And from the root folder of the project, just type:

```bash
$ npm link
$ npm update
```
