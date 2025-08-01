/* eslint-disable complexity */
/* eslint-disable dot-notation */
/* eslint-disable prettier/prettier */
'use strict';
const Generator = require('yeoman-generator');
var banner = require('./banner')
const { createMD4 } = require('hash-wasm');
var compare = require('compare-versions').compare;

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

    const allAddons = [
      {
        name: 'Google Docs 3.x',
        value: 'google-docs',
        checked: false
      },
      {
        name: 'JavaScript Console 0.7',
        value: 'js-console',
        checked: false
      },
      {
        name: 'Order of the Bee Support Tools 1.2.2.0',
        value: 'ootbee-support-tools',
        checked: false
      },
      {
        name: 'Share Site Creators 0.0.8',
        value: 'share-site-creators',
        checked: false
      },
      {
        name: 'Share Site Space Templates 1.1.4-SNAPSHOT',
        value: 'share-site-space-templates',
        checked: false
      },
      {
        name: 'Simple OCR 2.3.1 (for Alfresco 6.x)',
        value: 'simple-ocr',
        checked: false,
        acsVersions: ['6.1', '6.2']
      },
      {
        name: 'Alfresco OCR Transformer 1.0.0 (for Alfresco 7+)',
        value: 'alf-tengine-ocr',
        checked: false,
        acsVersions: ['7.0', '7.1', '7.2', '7.3', '7.4', '23.1', '23.2', '23.3', '23.4', '25.1', '25.2']
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
        checked: false,
        acsVersions: ['6.1', '6.2', '7.0', '7.1', '7.2', '7.3', '7.4']
      }
    ];

    const prompts = [
      {
        type: 'list',
        name: 'acsVersion',
        message: 'Which ACS version do you want to use?',
        choices: [ '6.1', '6.2', '7.0', '7.1', '7.2', '7.3', '7.4', '23.1', '23.2', '23.3', '23.4', '25.1', '25.2' ],
        default: '25.2'
      },
      {
        when: function (response) {
          var version = response.acsVersion ? response.acsVersion : commandProps['acsVersion'];
          return compare(version, '7.3', '>=') && compare(version, '23', '<');
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
          return response.https || commandProps['https']
        },
        type: 'input',
        name: 'port',
        message: 'What HTTPs port do you want to use (all the services are using the same port)?',
        default: '443'
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
        type: 'confirm',
        name: 'configureHttpIp',
        message: 'Do you want to specify a custom binding IP for HTTP?',
        default: false
      },
      {
        when: function (response) {
          return response.configureHttpIp;
        },
        type: 'input',
        name: 'httpBindingIp',
        message: 'Enter the IP address to bind the HTTP service:',
        default: '0.0.0.0'
      },
      {
        type: 'confirm',
        name: 'ftp',
        message: 'Do you want to use FTP (port 2121)?',
        default: false
      },
      {
        when: function (response) {
          return response.ftp;
        },
        type: 'confirm',
        name: 'configureFtpIp',
        message: 'Do you want to specify a custom binding IP for FTP?',
        default: false
      },
      {
        when: function (response) {
          return response.ftp && response.configureFtpIp;
        },
        type: 'input',
        name: 'ftpBindingIp',
        message: 'Enter the IP address to bind the FTP service:',
        default: '0.0.0.0'
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
          var version = response.acsVersion ? response.acsVersion : commandProps['acsVersion'];
          return version === '7.1'
        },
        type: 'list',
        name: 'solrHttpMode',
        message: 'Would you like to use HTTP, HTTPs or Shared Secret for Alfresco-SOLR communication?',
        choices: [ 'http', 'https', 'secret' ],
        default: 'http'
      },
      {
        when: function (response) {
          var version = response.acsVersion ? response.acsVersion : commandProps['acsVersion'];
          return compare(version, '7.2', '>=')
        },
        type: 'list',
        name: 'solrHttpMode',
        message: 'Would you like to use Shared Secret or HTTPs for Alfresco-SOLR communication?',
        choices: [ 'secret', 'https' ],
        default: 'secret'
      },
      {
        when: function (response) {
          var version = response.acsVersion ? response.acsVersion : commandProps['acsVersion'];
          return compare(version, '7.3', '>=')
        },
        type: 'confirm',
        name: 'activemq',
        message: 'Do you want to use the Events service (ActiveMQ)?',
        default: false
      },
      {
        when: function (response) {
          var version = response.acsVersion ? response.acsVersion : commandProps['acsVersion'];
          return compare(version, '7.1', '>=') &&
                 !(response.activemq === undefined) &&
                 (response.activemq || commandProps['activemq'])
        },
        type: 'confirm',
        name: 'activeMqCredentials',
        message: 'Do you want to use credentials for Events service (ActiveMQ)?',
        default: false
      },
      {
        when: function (response) {
          var version = response.acsVersion ? response.acsVersion : commandProps['acsVersion'];
          var creds = response.activeMqCredentials ? response.activeMqCredentials: commandProps['activeMqCredentials'];
          return compare(version, '7.1', '>=') && creds;
        },
        type: 'input',
        name: 'activeMqUser',
        message: 'Choose the USERNAME for your ActiveMQ user',
        default: 'admin'
      },
      {
        when: function (response) {
          var version = response.acsVersion ? response.acsVersion : commandProps['acsVersion'];
          var creds = response.activeMqCredentials ? response.activeMqCredentials: commandProps['activeMqCredentials'];
          return compare(version, '7.1', '>=') && creds;
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
        choices: (answers) => {
          // Filter addons based on the selected ACS version
          return allAddons.filter(addon =>
            !addon.acsVersions || addon.acsVersions.includes(answers.acsVersion)
          );
        },
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
    prompts.forEach(function (prompt) {
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
  async writing() {
    try {
      validateInputs(this.props);
    } catch (err) {
      this.log('Input validation error: ' + err.message);
      throw err;
    }
    this.copyDockerFiles();
    this.copyAddons();
    this.showWarnings();
    this.showServiceUrls();
  }

  /**
   * Copy Docker Compose, Dockerfiles, and config files
   * Adds error handling for file operations
   */
  async copyDockerFiles() {
    try {
      // Docker Compose environment variables values
      this.fs.copyTpl(
        this.templatePath(this.props.acsVersion + '/.env'),
        this.destinationPath('.env'),
        {
          serverName: this.props.serverName,
          bindIpFtp: this.props.ftpBindingIp,
          bindIpNginx: this.props.httpBindingIp
        }
      );
      // Copy Docker Compose applying configuration
      const ntlmHash = await computeHashPassword(this.props.password);
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
          secureComms: (this.props.solrHttpMode === 'http' ? 'none' : this.props.solrHttpMode),
          // Generate random password for Repo-SOLR secret communication method
          secretPassword: Math.random().toString(36).slice(2),
          password: ntlmHash,
          activemq: (this.props.activemq ? 'true' : 'false'),
          activeMqCredentials: (this.props.activeMqCredentials ? 'true' : 'false'),
          activeMqUser: this.props.activeMqUser,
          activeMqPassword: this.props.activeMqPassword,
          repository: (this.props.arch ? 'angelborroy' : 'alfresco'),
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
          repository: (this.props.arch && this.props.acsVersion === '7.3' ? 'angelborroy' : 'alfresco')
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
          repository: (this.props.arch && this.props.acsVersion === '7.3'  ? 'angelborroy' : 'alfresco'),
          serverName: this.props.serverName
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
          solrHttps: (this.props.solrHttpMode === 'https' ? 'true' : 'false'),
          ldap: (this.props.ldap ? 'true' : 'false')
        }
      );
      if (this.props.https) {
        this.fs.copy(
          this.templatePath('images/config/cert'),
          this.destinationPath('config/cert')
        );
      }
      // Copy mTLS Keystores
      if (this.props.solrHttpMode === 'https') {
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
      if (this.props.startscript) {
        this.fs.copyTpl(
          this.templatePath('scripts/start.sh'),
          this.destinationPath('start.sh'),
          {
            port: this.props.port,
            serverName: this.props.serverName,
            https: (this.props.https ? 'true' : 'false')
          }
        );
      }
      if (this.props.volumesscript) {
        this.fs.copy(
          this.templatePath('scripts/create_volumes.sh'),
          this.destinationPath('create_volumes.sh')
        );
      }
    } catch (err) {
      this.log('Error copying Docker files: ' + err.message);
    }
  }

  /**
   * Copy selected addons to their destinations
   * Adds error handling for file operations
   */
  copyAddons() {
    const ADDON_COPY_MAP = [
      {
        name: 'js-console',
        condition: (props) => props.addons.includes('js-console') && !props.addons.includes('ootbee-support-tools'),
        actions: [
          { src: 'addons/amps/javascript-console-repo-*.amp', dest: 'alfresco/modules/amps' },
          { src: 'addons/amps_share/javascript-console-share-*.amp', dest: 'share/modules/amps' }
        ]
      },
      {
        name: 'ootbee-support-tools',
        condition: (props) => props.addons.includes('ootbee-support-tools'),
        actions: [
          { src: 'addons/amps/support-tools-repo-*.amp', dest: 'alfresco/modules/amps' },
          { src: 'addons/amps_share/support-tools-share-*.amp', dest: 'share/modules/amps' }
        ]
      },
      {
        name: 'share-site-creators',
        condition: (props) => props.addons.includes('share-site-creators'),
        actions: [
          { src: 'addons/amps/share-site-creators-repo-*.amp', dest: 'alfresco/modules/amps' },
          { src: 'addons/amps_share/share-site-creators-share-*.amp', dest: 'share/modules/amps' }
        ]
      },
      {
        name: 'share-site-space-templates',
        condition: (props) => props.addons.includes('share-site-space-templates'),
        actions: [
          { src: 'addons/amps/share-site-space-templates-repo-*.amp', dest: 'alfresco/modules/amps' }
        ]
      },
      {
        name: 'simple-ocr',
        condition: (props) => props.addons.includes('simple-ocr'),
        actions: [
          { src: 'addons/jars/simple-ocr-repo-*.jar', dest: 'alfresco/modules/jars' },
          { src: 'addons/jars_share/simple-ocr-share-*.jar', dest: 'share/modules/jars' },
          { src: 'addons/ocrmypdf', dest: 'ocrmypdf' },
          { src: 'images/alfresco/bin', dest: 'alfresco/bin' },
          { src: 'images/alfresco/ssh', dest: 'alfresco/ssh' }
        ]
      },
      {
        name: 'alf-tengine-ocr',
        condition: (props) => props.addons.includes('alf-tengine-ocr'),
        actions: [
          { src: 'addons/alfresco-tengine-ocr/embed-metadata-action-*.jar', dest: 'alfresco/modules/jars' }
        ]
      },
      {
        name: 'esign-cert',
        condition: (props) => props.addons.includes('esign-cert'),
        actions: [
          { src: 'addons/amps/esign-cert-repo-*.amp', dest: 'alfresco/modules/amps' },
          { src: 'addons/amps_share/esign-cert-share-*.amp', dest: 'share/modules/amps' }
        ]
      },
      {
        name: 'share-online-edition',
        condition: (props) => props.addons.includes('share-online-edition'),
        actions: [
          { src: 'addons/amps_share/zk-libreoffice-addon-share*.amp', dest: 'share/modules/amps' }
        ]
      },
      {
        name: 'alfresco-pdf-toolkit',
        condition: (props) => props.addons.includes('alfresco-pdf-toolkit'),
        actions: [
          {
            src: (props) => props.acsVersion.startsWith('7') ? 'addons/amps/pdf-toolkit-repo-1.4.4-ACS-7*.amp' : 'addons/amps/pdf-toolkit-repo-1.4.4-SNAPSHOT*.amp',
            dest: 'alfresco/modules/amps'
          },
          { src: 'addons/amps_share/pdf-toolkit-share*.amp', dest: 'share/modules/amps' }
        ]
      }
    ];

    try {
      for (const addon of ADDON_COPY_MAP) {
        if (addon.condition(this.props)) {
          for (const action of addon.actions) {
            const src = typeof action.src === 'function' ? action.src(this.props) : action.src;
            this.fs.copy(
              this.templatePath(src),
              this.destinationPath(action.dest)
            );
          }
        }
      }
    } catch (err) {
      this.log('Error copying addon files: ' + err.message);
    }
  }

  /**
   * Show warnings and informational messages
   */
  showWarnings() {
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
    if (this.props.solrHttpMode === 'https') {
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
  }

  /**
   * Show service URLs and startup info
   */
  showServiceUrls() {
    let protocol = this.props.https ? 'https://' : 'http://';
    let port = this.props.port !== 80 && this.props.port !== 443 ? ':' + this.props.port : '';
    this.log('\n---------------------------------------------------\n' +
      'STARTING ALFRESCO\n\n' +
      'Start Alfresco using the command "docker compose up"\n' +
      'Once the plaform is ready, you will find a line similar to the following one in the terminal:\n' +
      'alfresco-1 | org.apache.catalina.startup.Catalina.start Server startup in [NNNNN] milliseconds\n\n' +
      'SERVICE URLs\n\n' +
      `   * UI: ${protocol}${this.props.serverName}${port}/\n` +
      `   * Legacy UI (users & groups management): ${protocol}${this.props.serverName}${port}/share\n` +
      `   * Repository (REST API): ${protocol}${this.props.serverName}${port}/alfresco\n\n` +
      'Remember to use as credentials: \n\n' +
      '   * username: admin \n' +
      `   * password: ${this.props.password}\n\n` +
      '---------------------------------------------------\n');
  }
};

// Convert parameter string value to boolean value
function normalize(option, prompt) {

  if (prompt.type === 'confirm' && typeof option === 'string') {
    let lc = option.toLowerCase();
    if (lc === 'true' || lc === 'false') {
      return (lc === 'true');
    }
      return option;
  }

  // Fix acsVersion value type
  if (prompt.name === 'acsVersion') {
    option = String(option);
  }

  return option;

}

// Calculate available memory for Repository, SOLR and Share
function getAvailableMemory(props) {

  var ram = (props.ram - 1) * 1024;

  // Content app and Proxy required RAM
  ram = ram - 256 - 128;

  if (props.acsVersion === '6.2') {
    ram -= 2048;
  }

  if (props.smtp) {
    ram -= 128;
  }
  if (props.ldap) {
    ram -= 256;
  }
  if (props.ocr) {
    ram -= 512;
  }
  return ram;

}

// Compute NTLMv1 MD4 Hash for Alfresco DB
async function computeHashPassword(password) {
  const md4 = await createMD4();
  md4.init();
  md4.update(Buffer.from(password, 'utf16le'));
  return md4.digest('hex');
}

// Add input validation for RAM, port, and password
function validateInputs(props) {
  if (isNaN(props.ram) || props.ram < 16) {
    throw new Error('RAM must be a number and at least 16 GB.');
  }
  if (isNaN(props.port) || props.port < 1 || props.port > 65535) {
    throw new Error('Port must be a valid number between 1 and 65535.');
  }
  if (!props.password || props.password.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }
}

