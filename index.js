var Promise = require("bluebird");
var config = require('./config.json');

var Slack = require('slack-client');
var autoreconnect = true;
var automark = true;
var apiKey = process.argv[2];
var slack = new Slack(config.slack.apiKey, autoreconnect, automark);

var plugins = [];

slack.on('open', function () {
  console.log("Connected to %s as %s", slack.team.name, slack.self.name);

  // load plugins
  var path = require("path");
  var fs = require("fs");
  var normalizedPath = path.join(__dirname, "plugins");
  fs.readdirSync(normalizedPath).forEach(function (pluginFile) {
    plugins.push(path.join(normalizedPath, pluginFile));
  });
  plugins = plugins.map(function (plugin) {
    var Plugin = require(plugin);
    return new Plugin(slack);
  });
});

slack.on('message', function handleMessage (msg) {
  Promise.filter(plugins, function (plugin) {
    return plugin.match(msg)
  })
  .each(function (plugin) {
    return plugin.processMessage(msg);
  })
  .catch(function (err) {
    console.log(err.stack);
  });
});

slack.login();
