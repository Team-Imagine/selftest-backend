// Request parameter에서 sequelize 내의 정렬에 필요한 옵션을 해석하는 함수
module.exports.getSortOptions = function (sort, default_column) {
  // 기본값이 주어지지 않는다면 ID 기준으로 설정
  if (!default_column) {
    default_column = "id";
  }

  let sortOptions = {};
  if (!sort) {
    // 기본값으로 ID 오름차순 정렬
    sortOptions = { column: default_column, order: "asc" };
  } else {
    // ':' 문자를 기준으로 split해서 옵션을 얻음
    sort = sort.split(":");
    column = sort[0];
    order = sort[1];
    if (!order) {
      // 기본값으로 오름차순
      order = "asc";
    }

    sortOptions = { column, order };
  }
  return sortOptions;
};
