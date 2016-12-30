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
    content: info.map(i => `${leftPad(i.label, longestLabel)}: ${colorize(i.value.toString())}`).join('\n')
  });

  titleBox.append(infoBox);

  return titleBox;
}

function getColor(str){
  return intToRGB(hashCode(str));
}

function colorize(str){
  var hash = getColor(str);
  return `{#${hash}-fg}${str}{/#${hash}-fg}`;
}

function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

module.exports = buildTitleBox;
