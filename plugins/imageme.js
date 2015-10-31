var _       = require("lodash");
var Promise = require("bluebird");
var images  = require("google-images");
var request = require("then-request");

function ImageMe(slack) {
  this.match = function (msg) {
    return msg.text && _.startsWith(msg.text.toLowerCase(), "image me");
  };

  this.processMessage = function (msg) {
    var channel = slack.getChannelGroupOrDMByID(msg.channel);
    var query = _.trimLeft(msg.text, "image me");

    return new Promise(function (resolve, reject) {
      images.search(query, function (err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    })
    .map(function (result) {
      return result.url;
    })
    .map(function (url) {
      return request('HEAD', url);
    })
    .filter(function (response) {
      return _.contains(response.headers["content-type"], "image");
    })
    .then(function (responses) {
      channel.send(_.sample(responses).url);
    });

  };

}

module.exports = ImageMe;
