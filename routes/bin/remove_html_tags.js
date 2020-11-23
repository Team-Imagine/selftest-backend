const htmlToText = require("html-to-text");

// HTML 태그를 제거한 텍스트를 가져옴
module.exports.getTextWithoutHtmlTags = function (text) {
  return htmlToText.fromString(text, {
    wordwrap: false,
  });
};
