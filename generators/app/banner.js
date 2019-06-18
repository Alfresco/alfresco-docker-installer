var chalk = require('chalk');
var _ = require('lodash');

// Extracted from https://github.com/binduwavell/generator-alfresco

var ALF_BLUE    = _.flow(chalk.bold, chalk.blue);
var ALF_BLUE2   = _.flow(chalk.dim, chalk.blue);
var ALF_ORANGE  = _.flow(chalk.dim, chalk.yellow);
var ALF_ORANGE2 = _.flow(chalk.bold, chalk.yellow);
var ALF_GREEN   = _.flow(chalk.bold, chalk.green);
var ALF_GREEN2  = _.flow(chalk.dim, chalk.green);

var GEN_TEXT    = _.flow(chalk.bold, chalk.blue);
var ALF_TEXT    = _.flow(chalk.bold, chalk.green);

var LEFT_PAD = '    ';
var banner = [
  '',
  LEFT_PAD + ALF_BLUE('         ,****.'),
  LEFT_PAD + ALF_BLUE('    ,.**') + ALF_BLUE2('. ') + ALF_BLUE('`*****  ') + ALF_ORANGE('<-_'),
  LEFT_PAD + ALF_BLUE('   *****') + ALF_BLUE2('*** ') + ALF_BLUE('**') + ALF_BLUE2('*** ') + ALF_ORANGE('####'),
  LEFT_PAD + ALF_BLUE('  $*****') + ALF_BLUE2('***:') + ALF_BLUE(':') + ALF_BLUE2('**** ') + ALF_ORANGE('####;'),
  LEFT_PAD + ALF_BLUE2('  _.-._`*') + ALF_BLUE2('**:') + ALF_BLUE(':') + ALF_BLUE2('*** ') + ALF_ORANGE('##') + ALF_ORANGE2('##') + ALF_ORANGE('##'),
  LEFT_PAD + ALF_BLUE(',**') + ALF_BLUE2('*****, *') + ALF_BLUE2('::') + ALF_BLUE2('* ') + ALF_ORANGE('.;') + ALF_ORANGE2('##### ') + ALF_GREEN('@'),
  LEFT_PAD + ALF_BLUE('****') + ALF_BLUE2('******,') + ALF_BLUE('\' ') + ALF_ORANGE('-=') + ALF_ORANGE2('#####\'') + ALF_GREEN(',@@@'),
  LEFT_PAD + ALF_BLUE('***\' ') + ALF_GREEN2('.,---') + ALF_GREEN(', ,.') + ALF_GREEN2('-==@@') + ALF_GREEN('@@@@@@'),
  LEFT_PAD + ALF_BLUE(' * ') + ALF_GREEN2('/@@@@@') + ALF_GREEN('\'') + ALF_GREEN2(',@ @') + ALF_GREEN('\\ ') + ALF_GREEN2('\'@@@@@') + ALF_GREEN('@@'),
  LEFT_PAD + ALF_GREEN2('  \'@@@@') + ALF_GREEN('/ ') + ALF_GREEN2('@@@ @@@') + ALF_GREEN('\\ ') + ALF_GREEN2('\':#\''),
  LEFT_PAD + ALF_GREEN('  !@@@@ ') + ALF_GREEN2('@@@@ @@@@') + ALF_GREEN('@@@@@^'),
  LEFT_PAD + ALF_GREEN('   @@@@ ') + ALF_GREEN2('@@@') + ALF_GREEN('@@ ') + ALF_GREEN2('@@@') + ALF_GREEN('@@@@\''),
  LEFT_PAD + ALF_GREEN('    `"$ ') + ALF_GREEN2('\'') + ALF_GREEN('@@@@@. ') + ALF_GREEN2('\'') + ALF_GREEN('##\''),
  LEFT_PAD + ALF_GREEN('         \'@@@@;\''),
  '',
  LEFT_PAD + GEN_TEXT(' DOCKER COMPOSE') + ALF_TEXT(' ALFRESCO'),
  ''
].join('\n');

module.exports = banner;