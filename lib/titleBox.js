var blessed = require('blessed');
var leftPad = require('left-pad')

var buildTitleBox = function(info){
  var title2 = "" +
  "             __              __   " + "\n" +
  "  __ _ __ __/ / ___  _______/ ___ " + "\n" +
  " /  ' / // / /_/ _ \\/ __/ _  / -_)" + "\n" +
  "/_/_/_\\_, /____\\___/_/  \\_,_/\\__/ " + "\n" +
  "     /___/                        ";
  var title = "" +
  "             __              _     " + "\n" +
  "   _____ _ _|  |   ___ ___ _| |___ " + "\n" +
  "  |     | | |  |__| . |  _| . | -_|" + "\n" +
  "  |_|_|_|_  |_____|___|_| |___|___|" + "\n" +
  "        |___| ";

  var titleBox = blessed.box({
    top: 0,
    left: 1,
    height: 6,
    width: '50%',
    content: title2,
    style: {
      fg: '#008b8b'
    }
  });

  var longestLabel = info.reduce((longest, curr) => {
    return curr.label.length > longest ? curr.label.length : longest;
  }, 0);
  var longestValue = info.reduce((longest, curr) => {
    return curr.value.length > longest ? curr.value.length : longest;
  }, 0);

  var infoBox = blessed.box({
    top: 0,
    right: 2,
    width: longestLabel + 2  + longestValue,
    tags: true,
    style: {
      fg: '#777777'
    },
    content: info.map(i => `${leftPad(i.label, longestLabel)}: {#F6E481-fg}${i.value}{/#F6E481-fg}`).join('\n')
  });

  titleBox.append(infoBox);

  return titleBox;
}

module.exports = buildTitleBox;
