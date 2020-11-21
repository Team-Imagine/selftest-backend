const { parse } = require("node-html-parser");

// blog URL을 업로드한 이미지의 URL로 대체
module.exports.convertUploadedImageUrls = function (content, uploaded_images) {
  const root = parse(content);
  const img_tags = root.querySelectorAll("img");
  for (let i = 0, upload_cnt = 0; i < img_tags.length, upload_cnt < uploaded_images.length; i++) {
    src_attribute = img_tags[i].getAttribute("src");

    // 업로드한 이미지가 아닐 경우 blob이 붙지 않음
    if (!src_attribute.startsWith("blob")) {
      continue;
    }
    // 업로드한 이미지일 경우, uploaded_images 배열의 url로 대체
    img_tags[i].setAttribute("src", uploaded_images[upload_cnt++].url);
  }
  return root.toString();
};
