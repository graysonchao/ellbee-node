var _ = require("lodash");
var images = require("google-images");

function ImageMe(slack) {
  this.match = function (msg) {
    return _.startsWith(msg.text.toLowerCase(), "image me");
  };

  this.processMessage = function (msg) {
    var query = _.trimLeft(msg.text, "image me");
    images.search(query, function (err, images) {
      var channel = slack.getChannelGroupOrDMByID(msg.channel);
      var response = _.sample(images).url;
      channel.send(response);
    });

  };

}

module.exports = ImageMe;
