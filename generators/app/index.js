'use strict';
const Generator = require('yeoman-generator');
var banner = require('./banner')
var nthash = require('smbhash').nthash;

/**
 * This module builds a Docker Compose template to use
 * Alfresco Repository and Search Services
*/
module.exports = class extends Generator {

  // Options to be chosen by the user
  prompting() {

    if (!this.options['skip-install-message']) {
      this.log(banner);
    }

    var commandProps = new Map();

    const prompts = [
      {
        type: 'list',
        name: 'acsVersion',
        message: 'Which ACS version do you want to use?',
        choices: [ '6.1', '6.2', '7.0', '7.1', '7.2', '7.3', '7.4' ],
        default: '7.4'
      },
      {
        when: function (response) {
          return response.acsVersion >= '7.3'  || commandProps['acsVersion'] >= '7.3'
        },
        type: 'confirm',
        name: 'arch',
        message: 'Do you want to deploy Alfresco in ARCH64 computer (like Apple Silicon)?',
        default: false
      },
      {
        type: 'input',
        name: 'ram',
        message: 'How may GB RAM are available for Alfresco (16 is minimum required)?',
        default: '16'
      },
      {
        type: 'confirm',
        name: 'https',
        message: 'Do you want to use HTTPs for Web Proxy?',
        default: false
      },
      {
        type: 'input',
        name: 'serverName',
        message: 'What is the name of your server?',
        default: 'localhost'
      },
      {
        type: 'input',
        name: 'password',
        message: 'Choose the password for your admin user',
        default: 'admin'
      },
      {
        when: function (response) {
          return !response.https || !commandProps['https']
        },
        type: 'input',
        name: 'port',
        message: 'What HTTP port do you want to use (all the services are using the same port)?',
        default: '80'
      },
      {
        when: function (response) {
          return response.https || commandProps['https']
        },
        type: 'input',
        name: 'port',
        message: 'What HTTPs port do you want to use (all the services are using the same port)?',
        default: '443'
      },
      {
        type: 'confirm',
        name: 'ftp',
        message: 'Do you want to use FTP (port 2121)?',
        default: false
      },
      {
        type: 'confirm',
        name: 'mariadb',
        message: 'Do you want to use MariaDB instead of PostgreSQL?',
        default: false
      },
      {
        type: 'confirm',
        name: 'crossLocale',
        message: 'Are you using different languages (this is the most common scenario)?',
        default: true
      },
      {
        type: 'confirm',
        name: 'enableContentIndexing',
        message: 'Do you want to search in the content of the documents?',
        default: true
      },
      {
        when: function (response) {
          return response.acsVersion == '7.1' || commandProps['acsVersion'] == '7.1'
        },
        type: 'list',
        name: 'solrHttpMode',
        message: 'Would you like to use HTTP, HTTPs or Shared Secret for Alfresco-SOLR communication?',
        choices: [ 'http', 'https', 'secret' ],
        default: 'http'
      },
      {
        when: function (response) {
          return response.acsVersion >= '7.2' || commandProps['acsVersion'] >= '7.2'
        },
        type: 'list',
        name: 'solrHttpMode',
        message: 'Would you like to use Shared Secret or HTTPs for Alfresco-SOLR communication?',
        choices: [ 'secret', 'https' ],
        default: 'secret'
      },
      {
        when: function (response) {
          return response.acsVersion >= '7.3'  || commandProps['acsVersion'] >= '7.3'
        },
        type: 'confirm',
        name: 'activemq',
        message: 'Do you want to use the Events service (ActiveMQ)?',
        default: false
      },
      {
        when: function (response) {
          return (response.activemq == undefined && (response.acsVersion >= '7.1' || commandProps['acsVersion'] >= '7.1')) ||
                 ((response.acsVersion >= '7.3'  || commandProps['acsVersion'] >= '7.3') &&
                 (response.activemq  || commandProps['activemq']))
        },
        type: 'confirm',
        name: 'activeMqCredentials',
        message: 'Do you want to use credentials for Events service (ActiveMQ)?',
        default: false
      },
      {
        when: function (response) {
          return (response.acsVersion >= '7.1' && response.activeMqCredentials) ||
                 (commandProps['acsVersion'] >= '7.1' && commandProps['activeMqCredentials'])
        },
        type: 'input',
        name: 'activeMqUser',
        message: 'Choose the USERNAME for your ActiveMQ user',
        default: 'admin'
      },
      {
        when: function (response) {
          return (response.acsVersion >= '7.1' && response.activeMqCredentials) ||
                 (commandProps['acsVersion'] >= '7.1' && commandProps['activeMqCredentials'])
        },
        type: 'input',
        name: 'activeMqPassword',
        message: 'Choose the PASSWORD for your ActiveMQ user',
        default: 'password'
      },
      {
        type: 'confirm',
        name: 'smtp',
        message: 'Do you want to create an internal SMTP server?',
        default: false
      },
      {
        type: 'confirm',
        name: 'ldap',
        message: 'Do you want to create an internal LDAP server?',
        default: false
      },
      {
        type: 'checkbox',
        name: 'addons',
        pageSize: 10,
        message: 'Select the addons to be installed:',
        choices: [
          {
            name: 'Google Docs 3.1.0',
            value: 'google-docs',
            checked: false
          },
          {
            name: 'JavaScript Console 0.7',
            value: 'js-console',
            checked: false
          },
          {
            name: 'Order of the Bee Support Tools 1.2.0.0',
            value: 'ootbee-support-tools',
            checked: false
          },
          {
            name: 'Share Site Creators 0.0.8',
            value: 'share-site-creators',
            checked: false
          },
          {
            name: 'Simple OCR 2.3.1 (for Alfresco 6.x)',
            value: 'simple-ocr',
            checked: false
          },
          {
            name: 'Alfresco OCR Transformer 1.0.0 (for Alfresco 7+)',
            value: 'alf-tengine-ocr',
            checked: false
          },
          {
            name: 'ESign Cert 1.8.4',
            value: 'esign-cert',
            checked: false
          },
          {
            name: 'Edit with LibreOffice in Alfresco Share 0.3.0',
            value: 'share-online-edition',
            checked: false
          },
          {
            name: 'Alfresco PDF Toolkit 1.4.4',
            value: 'alfresco-pdf-toolkit',
            checked: false
          }
        ]
      },
      {
        type: 'confirm',
        name: 'windows',
        message: 'Do you want Docker to manage volume storage (recommended when dealing with permission issues)?',
        default: false
      },
      {
        type: 'confirm',
        name: 'startscript',
        message: 'Do you want to use a start script?',
        default: false
      },
      {
        // Provide volumes permission script for Linux OS
        type: 'confirm',
        name: 'volumesscript',
        message: 'Do you want to get the script to create host volumes?',
        default: false
      }
    ];

    // Read options from command line parameters
    const filteredPrompts = [];
    prompts.forEach(function prompts(prompt) {
      const option = this.options[prompt.name];
      if (option === undefined) {
        filteredPrompts.push(prompt);
      } else {
        commandProps[prompt.name] = normalize(option, prompt);
      }
    }, this);

    // Prompt only for parameters not passed by command line
    return this.prompt(filteredPrompts).then(props => {
      this.props = props;
      Object.assign(props, commandProps);
    });

  }

  // Generate boilerplate from "templates" folder
  writing() {

    // Docker Compose environment variables values
    this.fs.copyTpl(
      this.templatePath(this.props.acsVersion + '/.env'),
      this.destinationPath('.env'),
      {
        serverName: this.props.serverName
      }
    )

    // Copy Docker Compose applying configuration
    this.fs.copyTpl(
      this.templatePath(this.props.acsVersion + '/docker-compose.yml'),
      this.destinationPath('docker-compose.yml'),
      {
        ram: getAvailableMemory(this.props),
        db: (this.props.mariadb ? 'mariadb' : 'postgres'),
        smtp: (this.props.smtp ? 'true' : 'false'),
        ldap: (this.props.ldap ? 'true' : 'false'),
        crossLocale: (this.props.crossLocale ? 'true' : 'false'),
        disableContentIndexing: (this.props.enableContentIndexing ? 'false' : 'true'),
        ocr: (this.props.addons.includes('simple-ocr') ? 'true' : 'false'),
        transformerocr: (this.props.addons.includes('alf-tengine-ocr') ? 'true' : 'false'),
        port: this.props.port,
        https: (this.props.https ? 'true' : 'false'),
        ftp: (this.props.ftp ? 'true' : 'false'),
        windows: (this.props.windows ? 'true' : 'false'),
        googledocs: (this.props.addons.includes('google-docs') ? 'true' : 'false'),
        serverName: this.props.serverName,
        solrHttpMode: this.props.solrHttpMode,
        secureComms: (this.props.solrHttpMode == 'http' ? 'none' : this.props.solrHttpMode),
        // Generate random password for Repo-SOLR secret communication method
        secretPassword: Math.random().toString(36).slice(2),
        password: computeHashPassword(this.props.password),
        activemq: (this.props.activemq ? 'true' : 'false'),
        activeMqCredentials: (this.props.activeMqCredentials ? 'true' : 'false'),
        activeMqUser: this.props.activeMqUser,
        activeMqPassword: this.props.activeMqPassword,
        repository: (this.props.arch ? 'angelborroy' : 'alfresco')
      }
    );

    // Copy Docker Image for Repository applying configuration
    this.fs.copyTpl(
      this.templatePath('images/alfresco/Dockerfile'),
      this.destinationPath('alfresco/Dockerfile'),
      {
        ocr: (this.props.addons.includes('simple-ocr') ? 'true' : 'false'),
        ftp: (this.props.ftp ? 'true' : 'false'),
        acsVersion: this.props.acsVersion,
        repository: (this.props.arch && this.props.acsVersion == '7.3' ? 'angelborroy' : 'alfresco')
      }
    );
    this.fs.copyTpl(
      this.templatePath('images/alfresco/modules'),
      this.destinationPath('alfresco/modules')
    );

    // Copy Docker Image for Share applying configuration
    this.fs.copyTpl(
      this.templatePath('images/share'),
      this.destinationPath('share'),
      {
        port: this.props.port,
        https: (this.props.https ? 'true' : 'false'),
        googledocs: (this.props.addons.includes('google-docs') ? 'true' : 'false'),
        acsVersion: this.props.acsVersion,
        repository: (this.props.arch && this.props.acsVersion == '7.3'  ? 'angelborroy' : 'alfresco')
      }
    );

    // Copy Docker Image for Search applying configuration
    this.fs.copyTpl(
      this.templatePath('images/search'),
      this.destinationPath('search'),
      {
        repository: (this.props.arch ? 'angelborroy' : 'alfresco')
      }
    );

    // Copy NGINX Configuration
    this.fs.copyTpl(
      this.templatePath('images/config/nginx'),
      this.destinationPath('config'),
      {
        port: this.props.port,
        https: (this.props.https ? 'true' : 'false'),
        solrHttps: (this.props.solrHttpMode == 'https' ? 'true' : 'false')
      }
    );
    if (this.props.https) {
      this.fs.copy(
        this.templatePath('images/config/cert'),
        this.destinationPath('config/cert')
      );
    }

    // Copy mTLS Keystores
    if (this.props.solrHttpMode == 'https') {
      this.fs.copy(
        this.templatePath('keystores'),
        this.destinationPath('keystores')
      );
    }

    // ActiveMQ
    if (!this.props.activemq && this.props.acsVersion < '7.4') {
      this.fs.copy(
        this.templatePath('addons/jars/activemq-broker-*.jar'),
        this.destinationPath('alfresco/modules/jars')
      );
    }

    // Addons
    if (this.props.addons.includes('js-console') && !this.props.addons.includes('ootbee-support-tools')) {
      this.fs.copy(
        this.templatePath('addons/amps/javascript-console-repo-*.amp'),
        this.destinationPath('alfresco/modules/amps')
      );
      this.fs.copy(
        this.templatePath('addons/amps_share/javascript-console-share-*.amp'),
        this.destinationPath('share/modules/amps')
      )
    }

    if (this.props.addons.includes('ootbee-support-tools')) {
      this.fs.copy(
        this.templatePath('addons/amps/support-tools-repo-*.amp'),
        this.destinationPath('alfresco/modules/amps')
      );
      this.fs.copy(
        this.templatePath('addons/amps_share/support-tools-share-*.amp'),
        this.destinationPath('share/modules/amps')
      )
    }

    if (this.props.addons.includes('share-site-creators')) {
      this.fs.copy(
        this.templatePath('addons/amps/share-site-creators-repo-*.amp'),
        this.destinationPath('alfresco/modules/amps')
      );
      this.fs.copy(
        this.templatePath('addons/amps_share/share-site-creators-share-*.amp'),
        this.destinationPath('share/modules/amps')
      )
    }

    if (this.props.addons.includes('simple-ocr')) {
      this.fs.copy(
        this.templatePath('addons/jars/simple-ocr-repo-*.jar'),
        this.destinationPath('alfresco/modules/jars')
      );
      this.fs.copy(
        this.templatePath('addons/jars_share/simple-ocr-share-*.jar'),
        this.destinationPath('share/modules/jars')
      );
      this.fs.copy(
        this.templatePath('addons/ocrmypdf'),
        this.destinationPath('ocrmypdf')
      );
      this.fs.copy(
        this.templatePath('images/alfresco/bin'),
        this.destinationPath('alfresco/bin')
      );
      this.fs.copy(
        this.templatePath('images/alfresco/ssh'),
        this.destinationPath('alfresco/ssh')
      );
    }

    if (this.props.addons.includes('alf-tengine-ocr')) {
      this.fs.copy(
        this.templatePath('addons/alfresco-tengine-ocr/embed-metadata-action-*.jar'),
        this.destinationPath('alfresco/modules/jars')
      )
    }

    if (this.props.addons.includes('esign-cert')) {
        this.fs.copy(
          this.templatePath('addons/amps/esign-cert-repo-*.amp'),
          this.destinationPath('alfresco/modules/amps')
        );
        this.fs.copy(
          this.templatePath('addons/amps_share/esign-cert-share-*.amp'),
          this.destinationPath('share/modules/amps')
        )
    }

    if (this.props.addons.includes('share-online-edition')) {
      this.fs.copy(
        this.templatePath('addons/amps_share/zk-libreoffice-addon-share*.amp'),
        this.destinationPath('share/modules/amps')
      )
    }

    if (this.props.addons.includes('alfresco-pdf-toolkit')) {
      if (this.props.acsVersion.startsWith('7')) {
        this.fs.copy(
          this.templatePath('addons/amps/pdf-toolkit-repo-1.4.4-ACS-7*.amp'),
          this.destinationPath('alfresco/modules/amps')
        )
      } else {
        this.fs.copy(
          this.templatePath('addons/amps/pdf-toolkit-repo-1.4.4-SNAPSHOT*.amp'),
          this.destinationPath('alfresco/modules/amps')
        )
      }
      this.fs.copy(
        this.templatePath('addons/amps_share/pdf-toolkit-share*.amp'),
        this.destinationPath('share/modules/amps')
      )
    }

    if (this.props.startscript) {
      this.fs.copyTpl(
        this.templatePath('scripts/start.sh'),
        this.destinationPath('start.sh'),
        {
          port: this.props.port,
          serverName: this.props.serverName,
          https: (this.props.https ? 'true' : 'false')
        }
      )
    }

    if (this.props.volumesscript) {
      this.fs.copy(
        this.templatePath('scripts/create_volumes.sh'),
        this.destinationPath('create_volumes.sh')
      )
    }

    if (this.props.addons.includes('share-site-creators')) {
        this.log('\n   ---------------------------------------------------\n' +
        '   WARNING: You selected the addon share-site-creators. \n' +
        '   Remember to add any user to group GROUP_SITE_CREATORS \n' +
        '   ---------------------------------------------------\n');
    }

    if (this.props.https) {
      this.log('\n   ---------------------------------------------------------------\n' +
      '   WARNING: You selected HTTPs for the NGINX Web Proxy. \n' +
      '   Default certificates localhost.cer and localhost.key have been \n' +
      '   provided in config/cert folder. \n' +
      '   You may replace these certificates by your own. \n' +
      '   ---------------------------------------------------------------\n');
    }

    if (this.props.solrHttpMode == 'https') {
      this.log('\n   ---------------------------------------------------------------\n' +
      '   WARNING: You selected HTTPs communication for Alfresco-Solr. \n' +
      '   Default keystores have been provided in keystores folder. \n' +
      '   You may replace these certificates by your own. \n' +
      '   Check https://github.com/Alfresco/alfresco-ssl-generator \n' +
      '   ---------------------------------------------------------------\n');
    }

    if (this.props.addons.includes('alf-tengine-ocr')) {
      this.log('\n   ---------------------------------------------------------------\n' +
      '   NOTE: You selected to use Alfresco OCR Transformer 1.0.0 (for Alfresco 7+). \n' +
      '   Default Docker Image (angelborroy/alfresco-tengine-ocr:1.0.0) only includes support for English. \n' +
      '   You may replace this in docker-compose.yml by "angelborroy/alfresco-tengine-ocr:1.0.0-deu-fra-spa-ita" \n' +
      '   to provide support for English, German, French, Spanish and Italian. \n' +
      '   Or you may build your customized Docker Image using https://github.com/aborroy/alf-tengine-ocr/tree/master/ats-transformer-ocr \n' +
      '   ---------------------------------------------------------------\n');
    }

    if (this.props.addons.includes('share-online-edition')) {
      this.log('\n   ---------------------------------------------------\n' +
      '   WARNING: You selected the addon share-online-edition. \n' +
      '   Remember to register required protocol in your client computer. \n' +
      '   Check https://github.com/zylklab/alfresco-share-online-edition-addon#registering-the-protocols \n' +
      '   ---------------------------------------------------\n');
    }

    // Service URLs
    let protocol = this.props.https ? 'https://' : 'http://'
    let port = this.props.port != 80 && this.props.port != 443 ? ':' + this.props.port : ''
    this.log('\n---------------------------------------------------\n' +
    'STARTING ALFRESCO\n\n' +
    'Start Alfresco using the command "docker compose up"\n' +
    'Once the plaform is ready, you will find a line similar to the following one in the terminal:\n' +
    'alfresco-1 | org.apache.catalina.startup.Catalina.start Server startup in [NNNNN] milliseconds\n\n' +
    'SERVICE URLs\n\n' +
    '   * UI: ' + protocol + this.props.serverName + port + '/\n' +
    '   * Legacy UI (users & groups management): ' + protocol + this.props.serverName + port + '/share\n' +
    '   * Repository (REST API): ' + protocol + this.props.serverName + port + '/alfresco\n\n' +
    'Remember to use as credentials: \n\n' +
    '   * username: admin \n' +
    '   * password: ' + this.props.password + '\n\n' +
    '---------------------------------------------------\n');

  }

};

// Convert parameter string value to boolean value
function normalize(option, prompt) {

  if (prompt.type === 'confirm' && typeof option === 'string') {
    let lc = option.toLowerCase();
    if (lc === 'true' || lc === 'false') {
      return (lc === 'true');
    } else {
      return option;
    }
  }

  return option;

}

// Calculate available memory for Repository, SOLR and Share
function getAvailableMemory(props) {

  var ram = (props.ram - 1) * 1024;

  // Content app and Proxy required RAM
  ram = ram - 256 - 128;

  if (props.acsVersion == '6.2') {
    ram = ram - 2048;
  }

  if (props.smtp) {
    ram = ram - 128;
  }
  if (props.ldap) {
    ram = ram - 256;
  }
  if (props.ocr) {
    ram = ram - 512;
  }
  return ram;

}

// Compute NTLMv1 MD4 Hash for Alfresco DB
function computeHashPassword(password) {
  return nthash(password).toLowerCase();
}

