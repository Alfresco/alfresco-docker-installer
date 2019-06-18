'use strict';
const Generator = require('yeoman-generator');
var banner = require('./banner')

/**
 * This module buids a Docker Compose template to use
 * Alfresco Repository and Search Services
*/
module.exports = class extends Generator {

  // Options to be chosen by the user
  prompting() {

    if (!this.options['skip-install-message']) {
      this.log(banner);
    }

    const prompts = [
      {
        type: 'input',
        name: 'acsVersion',
        message: 'Which Alfresco version do you want to use?',
        default: '6.1'
      },
      {
        type: 'input',
        name: 'ram',
        message: 'How may GB RAM are available for Alfresco (8 is minimum required)?',
        default: '8'
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
        message: 'Select the addons to be installed:',
        choices: [
          {
            name: 'JavaScript Console 0.6',
            value: 'js-console',
            checked: true
          }, 
          {
            name: 'Order of the Bee Support Tools 1.0.0.0',
            value: 'ootbee-support-tools',
            checked: true
          }, 
          {
            name: 'Share Site Creators 0.0.7',
            value: 'share-site-creators',
            checked: true
          }, 
          {
            name: 'Simple OCR 2.3.1',
            value: 'simple-ocr',
            checked: false
          }, 
          {
            name: 'ESign Cert 1.8.2',
            value: 'esign-cert',
            checked: false
          }        
        ]
      }
    ];

    // Read options from command line parameters
    const filteredPrompts = [];
    const commandProps = new Map();
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
    this.fs.copy(
      this.templatePath(this.props.acsVersion + '/.env'),
      this.destinationPath('.env'),
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
        ocr: (this.props.addons.includes('simple-ocr') ? 'true' : 'false')
      }
    );

    // Copy Docker Image for Repository applying configuration
    this.fs.copyTpl(
      this.templatePath(this.props.acsVersion + '/alfresco/Dockerfile'),
      this.destinationPath('alfresco/Dockerfile'),
      {
        ocr: (this.props.addons.includes('simple-ocr') ? 'true' : 'false')
      }
    );
    this.fs.copyTpl(
      this.templatePath(this.props.acsVersion + '/alfresco/modules'),
      this.destinationPath('alfresco/modules')
    );

    // Copy Docker Image for Share applying configuration
    this.fs.copyTpl(
      this.templatePath(this.props.acsVersion + '/share'),
      this.destinationPath('share')
    );

    // Copy Docker Image for Search applying configuration
    this.fs.copyTpl(
      this.templatePath(this.props.acsVersion + '/search'),
      this.destinationPath('search')
    );

    // Copy NGINX Configuration
    this.fs.copyTpl(
      this.templatePath(this.props.acsVersion + '/config'),
      this.destinationPath('config')
    );

    // Addons
    if (this.props.addons.includes('js-console')) {
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
        this.templatePath(this.props.acsVersion + '/alfresco/bin'),
        this.destinationPath('alfresco/bin')
      );  
      this.fs.copy(
        this.templatePath(this.props.acsVersion + '/alfresco/ssh'),
        this.destinationPath('alfresco/ssh')
      );  
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

