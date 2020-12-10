# SelfTest Backend: API List

* **baseurl**: /api

## 회원가입, 로그인 및 인증

### 로그인

`POST /auth/login`

- 로그인 후 브라우저에 access token 및 refresh token을 쿠키로 저장합니다.

| Parameter | Method | Type   | Description           |
| --------- | ------ | ------ | --------------------- |
| email     | body   | string | **Required** 이메일   |
| password  | body   | string | **Required** 비밀번호 |

### 로그아웃

`POST /auth/logout`

- 로그아웃 후 브라우저의 토큰을 삭제합니다.

### 회원가입

`POST /auth/register`

| Parameter        | Method | Type   | Description           |
| ---------------- | ------ | ------ | --------------------- |
| email            | body   | string | **Required**          |
| username         | body   | string | **Required** 닉네임   |
| current_password | body   | string | **Required** 비밀번호 |
| first_name       | body   | string | **Required** 이름     |
| last_name        | body   | string | **Required** 성       |
| phone_number     | body   | string | 전화번호              |

### 회원가입 인증 이메일 전송

`POST /auth/send-verification-email`

- 가입한 사용자 이메일로 인증 코드를 보냅니다.
- **인증 코드 유효 기간**: 3분

### 회원가입 인증 코드 검증

`POST /auth/verify-email`

| Parameter         | Method | Type   | Description                     |
| ----------------- | ------ | ------ | ------------------------------- |
| verification_code | body   | string | **Required** 회원가입 인증 코드 |

## 사용자

### 비밀번호 초기화 인증 코드 전송

`POST /user/forgot-password`

- 사용자 비밀번호 초기화 인증 코드를 이메일로 전송합니다.

- **인증 코드 유효 기간**: 3분

| Parameter | Method | Type   | Description                |
| --------- | ------ | ------ | -------------------------- |
| email     | body   | string | **Required** 사용자 이메일 |

### 비밀번호 초기화 인증 코드 검증 및 비밀번호 변경

`POST /user/verify-change-password`

- 인증 코드가 일치하다면 사용자의 비밀번호를 새로운 비밀번호로 변경합니다.

- 3분 이내에 입력하지 않으면 다시 발급받아야 합니다.
- 새로운 비밀번호의 길이가 8 이상이 아니라면 실패합니다.

| Parameter    | Method | Type   | Description                       |
| ------------ | ------ | ------ | --------------------------------- |
| code         | body   | string | **Required** 이메일로 온 인증코드 |
| new_password | body   | string | **Required** 변경할 비밀번호      |

### 사용자 정보 수정

`PATCH /user`

- 로그인한 사용자 정보를 (일부) 수정합니다.

- 각 정보는 입력이 안돼도 됩니다. (아무것도 수정하지 않아도 성공)
- 단, current_password가 입력됐다면 new_password도 입력되어야 합니다. (비밀번호 변경 요청이라 간주)
- 변경할 username과 동일한 username을 가진 사용자가 이미 존재한다면 실패합니다.

| Parameter        | Method | Type   | Description     |
| ---------------- | ------ | ------ | --------------- |
| username         | body   | string | 새로운 닉네임   |
| current_password | body   | string | 기존 비밀번호   |
| new_password     | body   | string | 새로운 비밀번호 |
| first_name       | body   | string | 이름            |
| last_name        | body   | string | 성              |

### 회원 탈퇴

`DELETE /user`

- 로그인한 사용자를 탈퇴시킵니다.

## 과목

### 과목 목록 조회

`GET /subject`

| Parameter       | Method | Type   | Description                  |
| --------------- | ------ | ------ | ---------------------------- |
| page            | query  | int    | 페이지 번호 (디폴트 1)       |
| per_page        | query  | int    | 페이지당 문제 수 (디폴트 10) |
| q_subject_title | query  | string | 과목 제목 검색어             |

```json
200
{
    "success": true,
    "message": "...",
    "subjects": {
        "count": 10,
        "rows": [
        	{
        		...
        	}
    	]
    }
}
```

### 과목 등록

`POST /subject`

| Parameter     | Method | Type   | Description            |
| ------------- | ------ | ------ | ---------------------- |
| title         | query  | string | **Required** 강의 제목 |
| subject_title | query  | string | **Required** 과목 제목 |

```json
200
{
    "success": true,
    "message": "...",
}
```

## 강의

### 강의 목록 조회

`GET /course`

| Parameter      | Method | Type   | Description                  |
| -------------- | ------ | ------ | ---------------------------- |
| page           | query  | int    | 페이지 번호 (디폴트 1)       |
| per_page       | query  | int    | 페이지당 문제 수 (디폴트 10) |
| subject_title  | query  | string | 과목 제목                    |
| q_course_title | query  | string | 강의 제목 검색어             |

```json
200
{
    "success": true,
    "message": "...",
    "courses": {
        "count": 10,
        "rows": [
        	{
        		...
        	}
    	]
    }
}
```

### 강의 등록

`POST /course`

| Parameter     | Method | Type   | Description            |
| ------------- | ------ | ------ | ---------------------- |
| title         | query  | string | **Required** 강의 제목 |
| subject_title | query  | string | **Required** 과목 제목 |

```json
200
{
    "success": true,
    "message": "...",
    "course": {
        "title": "이산수학",
        "subject": {
            "title": "수학",
        }
    }
}
```

## 문제

### 문제 목록 조회

`GET /question`

| Parameter          | Method | Type   | Description                                                  |
| ------------------ | ------ | ------ | ------------------------------------------------------------ |
| page               | query  | int    | 페이지 번호 (디폴트 1)                                       |
| per_page           | query  | int    | 페이지당 문제 수 (디폴트 10)                                 |
| course_title       | query  | string | 강의 제목                                                    |
| question_type      | query  | string | 문제 유형 (객관식 multiple_choice, 단답형 short_answer, 서술형 essay 세 유형 중 하나 고를 수 있음) |
| q_question_title   | query  | string | 문제 제목 검색어                                             |
| q_question_content | query  | string | 문제 내용 검색어                                             |
| sort               | query  | string | 정렬 옵션 (컬럼:정렬) (컬럼: id, title, type, content, blocekd, created_at으로 정렬 가능) (정렬: 오름차순 asc, 내림차순 desc) |

```json
200
{
    "success": true,
    "message": "...",
    "questions": {
        "count": 10,
        "rows": [
        	{
        		...
        		"likeable_entity.total_likes": 10,
                "likeable_entity.total_dislikes": 2,
                "average_difficulty": 4.0,
                "average_freshness": 6.0,
        	}
    	]
    }
}
```

### 문제 조회

`GET /question/{id}`

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

### 랜덤 문제 목록 불러오기

`GET /course/{course_title}/random`

- 과목 이름 `course_title`에 해당하는 문제를 랜덤으로 가져옵니다.

| Parameter     | Method | Type   | Description               |
| ------------- | ------ | ------ | ------------------------- |
| course_title  | param  | string | **Required** 과목 이름    |
| num_questions | query  | string | **Required** 총 문제 개수 |

```json
200
{
    "success": true,
    "message": "...",
    "questions": {
        "count": 25,
        "rows": [
        	{
        		...
        	}
    	]
    }
}
```

### 평가 기반 문제 목록 불러오기

`GET /course/{course_title}/evaluation-based`

- 평가 기반 출제 알고리즘 (평가가 좋은 순)
  - 1~10번: level1 = 난이도 5 이하 문제 중 `num_questions`의 40%만큼의 개수를 선택
  - 11~20번: level2 = 난이도 5 초과 7 이하 문제 중 `num_questions`의 40%만큼의 개수를 선택
  - 21~25번: level3 = 난이도 7 초과 10 이하 문제 중 `num_questions`의 20%만큼의 개수를 선택

- 난이도별로 부족한 것을 찾아서 메꿈
  - level3에서 문제가 부족할 경우 그만큼 level2에서 문제를 채움
  - level2에서 문제가 부족할 경우 그만큼 level1에서 문제를 채움
  - 이렇게 해도 `num_questions` 만큼의 문제가 안된다면 어쩔 수 없음

| Parameter     | Method | Type   | Description              |
| ------------- | ------ | ------ | ------------------------ |
| course_title  | param  | string | **Required** 과목 이름   |
| num_questions | query  | string | 총 문제 개수 (디폴트 25) |

```json
200
{
    "success": true,
    "message": "...",
    "questions": {
        "count": 25,
        "rows": [
        	{
        		...
        	}
    	]
    }
}
```

### 문제 생성

`POST /question`

- 로그인한 사용자로 문제를 업로드합니다.

| Parameter             | Method | Type   | Description                                                  |
| --------------------- | ------ | ------ | ------------------------------------------------------------ |
| title                 | body   | string | **Required** 문제 제목                                       |
| type                  | body   | string | **Required** 문제 유형 (multiple_choice, short_answer, essay 중 택1) |
| content               | body   | string | **Required** HTML로 작성된 문제 내용                         |
| course_title          | body   | string | **Required** 과목 이름                                       |
| multiple_choice_items | body   | array  | (객관식 유형일 경우) 객관식 보기                             |
| short_answer_items    | body   | array  | (주관식 유형일 경우) 주관식 보기                             |
| uploaded_images       | body   | array  | (이미지가 있을 경우) 이미지 객체 배열                        |

```json
200
{
    "success": true,
    "message": "...",
    "question": {
        "id": 1
    }
}
```

### 문제 내용 수정

`PUT /question/{id}`

- 로그인한 사용자로 업로드한 문제를 수정합니다.

| Parameter             | Method | Type   | Description                                  |
| --------------------- | ------ | ------ | -------------------------------------------- |
| id                    | param  | string | **Required** 문제 ID                         |
| title                 | body   | string | **Required** 수정할 문제 제목                |
| content               | body   | string | **Required** HTML로 작성된 수정할 문제 내용  |
| course_title          | body   | string | **Required** 수정할 과목 이름                |
| multiple_choice_items | body   | array  | (객관식 유형일 경우) 수정할 객관식 보기      |
| short_answer_items    | body   | array  | (주관식 유형일 경우) 수정할 주관식 보기      |
| uploaded_images       | body   | array  | (이미지가 있을 경우) 수정할 이미지 객체 배열 |

```json
200
{
    "success": true,
    "message": "...",
    "question": {
        "id": 1
    }
}
```

## 문제 평가 - 좋아요 / 싫어요 / 난이도 / 신선도

### 사용자가 문제 좋아요/싫어요 했는지 여부 확인

`GET /like/{id}`

`GET /dislike/{id}`

- 로그인한 사용자가 해당 문제를 좋아요 했는지 싫어요 했는지 확인

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

```json
200
{
    "success": true,
    "message": "...",
    "is_liked": true,
    "is_disliked": false
}
```

### 문제 좋아요/싫어요 처리

`POST /like/{id}`

`POST /dislike/{id}`

- 로그인한 사용자로 문제를 좋아요/싫어요 처리
- 기존 싫어요/좋아요 정보는 삭제

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

### 문제 좋아요/싫어요 취소

`DELETE /like/{id}`

`DELETE /dislike/{id}`

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

### 사용자가 문제 신선도 평가 했는지 여부 확인

`GET /freshness/{id}`

- 로그인한 사용자가 해당 문제의 신선도를 평가한 적 있는지 여부 확인

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

```json
200
{
    "success": true,
    "message": "...",
    "is_freshness_evaluated": true
}
```

### 문제 신선도 평가

`POST /freshness/{id}`

- 로그인한 사용자로 문제의 신선도 평가

| Parameter | Method | Type | Description                            |
| --------- | ------ | ---- | -------------------------------------- |
| id        | param  | int  | **Required** 문제 ID                   |
| fresh     | body   | int  | **Required** 신선도 (0 ~ 10, 0은 제거) |

### 문제 신선도 수정

`PUT /freshness/{id}`

- 로그인한 사용자가 평가했던 신선도 수정

| Parameter | Method | Type | Description                            |
| --------- | ------ | ---- | -------------------------------------- |
| id        | param  | int  | **Required** 문제 ID                   |
| fresh     | body   | int  | **Required** 신선도 (0 ~ 10, 0은 제거) |

### 문제 신선도 삭제

`DELETE /freshness/{id}`

- 로그인한 사용자가 평가했던 신선도 삭제

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

### 사용자가 문제 난이도 평가 했는지 여부 확인

`GET /difficulty/{id}`

- 로그인한 사용자가 해당 문제의 난이도를 평가한 적 있는지 여부 확인

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

```json
200
{
    "success": true,
    "message": "...",
    "is_difficulty_evaluated": true
}
```

### 문제 난이도 평가

`POST /difficulty/{id}`

- 로그인한 사용자로 문제의 난이도 평가

| Parameter | Method | Type | Description                            |
| --------- | ------ | ---- | -------------------------------------- |
| id        | param  | int  | **Required** 문제 ID                   |
| fresh     | body   | int  | **Required** 신선도 (0 ~ 10, 0은 제거) |

### 문제 난이도 수정

`PUT /difficulty/{id}`

- 로그인한 사용자가 평가했던 난이도 수정

| Parameter | Method | Type | Description                            |
| --------- | ------ | ---- | -------------------------------------- |
| id        | param  | int  | **Required** 문제 ID                   |
| score     | body   | int  | **Required** 난이도 (0 ~ 10, 0은 제거) |

### 문제 난이도 삭제

`DELETE /difficulty/{id}`

- 로그인한 사용자가 평가했던 난이도 삭제

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

## 문제 즐겨찾기 (Bookmark)

### 즐겨찾기 목록 불러오기 

`GET /api/bookmark` 

- 로그인한 사용자의 즐겨찾기 목록을 불러옵니다
  page, per_page는 문제 목록 불러오는 라우팅과 동일합니다 (페이지 기능)
  반환값으로 bookmarks 안에 배열로 들어가있을거에요

| Parameter | Method | Type | Description                  |
| --------- | ------ | ---- | ---------------------------- |
| page      | query  | int  | 페이지 번호 (디폴트 1)       |
| per_page  | query  | int  | 페이지당 문제 수 (디폴트 10) |

```json
200
{
    "success": true,
    "message": "...",
    "bookmarks": {
        "count": 3,
        "rows": [
         	...   
        ]
    }
}
```

### 해당 문제를 즐겨찾기한 적 있는지 확인

`GET /bookmark/{id}`

- 로그인한 사용자가 해당 문제를 즐겨찾기 한 적 있는지 확인합니다.

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

```json
200
{
    "success": true,
    "message": "...",
    "question.is_bookmarked": true
}
```

### 문제를 즐겨찾기에 추가

`POST /bookmark/{id}`

- 문제를 로그인한 사용자의 즐겨찾기 리스트에 추가합니다

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

`DELETE /bookmark/{id}`

- 문제를 즐겨찾기에서 삭제합니다

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 문제 ID |

## 문제 댓글

### 댓글 조회

`GET /comment`

| Parameter             | Method | Type   | Description                  |
| --------------------- | ------ | ------ | ---------------------------- |
| page                  | query  | int    | 페이지 번호 (디폴트 1)       |
| per_page              | query  | int    | 페이지당 항목 수 (디폴트 10) |
| commentable_entity_id | query  | int    | **Required** 댓글 객체 ID    |
| username              | query  | string | 사용자 닉네임                |

```json
200
{
    "success": true,
    "message": "...",
    "comments": {
        "count": 3,
        "rows": [
         	...
        ]
    }
}
```

### 댓글 생성

`POST /comment/{id}`

| Parameter             | Method | Type   | Description               |
| --------------------- | ------ | ------ | ------------------------- |
| commentable_entity_id | param  | int    | **Required** 댓글 객체 ID |
| content               | body   | string | **Required** 댓글 내용    |

```json
200
{
    "success": true,
    "message": "..."
}
```



### 댓글 수정

`PUT /comment/{id}`

| Parameter             | Method | Type   | Description               |
| --------------------- | ------ | ------ | ------------------------- |
| commentable_entity_id | param  | int    | **Required** 댓글 객체 ID |
| content               | body   | string | **Required** 댓글 내용    |

```json
200
{
    "success": true,
    "message": "...",
    "comment": {
        "id": 1
    }
}
```

### 댓글 삭제

`DELETE /comment/{id}`

| Parameter             | Method | Type | Description               |
| --------------------- | ------ | ---- | ------------------------- |
| commentable_entity_id | param  | int  | **Required** 댓글 객체 ID |

```json
200
{
    "success": true,
    "message": "..."
}
```

## 시험

### 시험 목록 조회

`GET /testset`

| Parameter | Method | Type | Description                  |
| --------- | ------ | ---- | ---------------------------- |
| page      | query  | int  | 페이지 번호 (디폴트 1)       |
| per_page  | query  | int  | 페이지당 문제 수 (디폴트 10) |

```json
200
{
    "success": true,
    "message": "...",
    "test_sets": {
        "count": 10,
        "rows": [
            ...
        ]
    }
}
```

### 시험 문제 목록 조회

`GET /testset/{id}`

| Parameter | Method | Type | Description                  |
| --------- | ------ | ---- | ---------------------------- |
| page      | query  | int  | 페이지 번호 (디폴트 1)       |
| per_page  | query  | int  | 페이지당 문제 수 (디폴트 10) |
| id        | param  | int  | **Required** 시험 ID         |

```json
200
{
    "success": true,
    "message": "...",
    "test_set": {
        ...
    }
}
```

### 시험 정답 목록 조회

`GET /testset/{id}/answers`

| Parameter | Method | Type | Description                  |
| --------- | ------ | ---- | ---------------------------- |
| page      | query  | int  | 페이지 번호 (디폴트 1)       |
| per_page  | query  | int  | 페이지당 문제 수 (디폴트 10) |
| id        | param  | int  | **Required** 시험 ID         |

```json
200
{
    "success": true,
    "message": "...",
    "test_set": {
        ...
    }
}
```

### 시험에 복수개의 문제 추가

`POST /testset/question`

| Parameter   | Method | Type  | Description          |
| ----------- | ------ | ----- | -------------------- |
| test_set_id | body   | int   | **Required** 시험 ID |
| questions   | body   | array | 문제 목록            |

```json
200
{
    "success": true,
    "message": "...",
    "test_questions": {
        ...
    },
    "existing_questions": 1,
    "not_existing_questions": 0,
    "invalid_questions": 0
}
```

### 시험 문제 목록 수정

`PUT /testset/question`

| Parameter   | Method | Type  | Description          |
| ----------- | ------ | ----- | -------------------- |
| test_set_id | body   | int   | **Required** 시험 ID |
| questions   | body   | array | 문제 목록            |

```json
200
{
    "success": true,
    "message": "...",
    "test_questions": {
        ...
    },
    "not_existing_questions": 0,
    "invalid_questions": 0
}
```

### 빈 시험 추가

`POST /testset`

| Parameter | Method | Type   | Description            |
| --------- | ------ | ------ | ---------------------- |
| title     | body   | string | **Required** 시험 이름 |

```json
200
{
    "success": true,
    "message": "...",
    "test_set": {
        ...
    }
}
```

### 시험 삭제

`DELETE /testset/{id}`

| Parameter | Method | Type | Description          |
| --------- | ------ | ---- | -------------------- |
| id        | param  | int  | **Required** 시험 ID |

```json
200
{
    "success": true,
    "message": "...",
    "test_set": {
        ...
    }
}
```

### 시험 문제 삭제

`DELETE /testset/question/{id}`

| Parameter | Method | Type | Description               |
| --------- | ------ | ---- | ------------------------- |
| id        | param  | int  | **Required** 시험 문제 ID |

```json
200
{
    "success": true,
    "message": "...",
    "test_question": {
        "id": 10
    },
    "result": ...
}
```

## 출석

### 출석 내역 조회

`GET /attendance`

- 로그인한 사용자가 출석한 내역을 조회합니다.

| Parameter | Method | Type | Description               |
| --------- | ------ | ---- | ------------------------- |
| page      | query  | int  | 페이지 번호 (디폴트 1)    |
| per_page  | query  | int  | 페이지당 내역 (디폴트 10) |

```json
200
{
    "success": true,
    "message": "...",
    "attendances": {
        count: 10,
        rows: [
            {
                "created_at": "...",
                ...
            },
            ...
        ]
    }
}
```

### 출석 여부 확인

`GET /attedance/today`

- 오늘 출석 했는지 여부 확인
- 출석했다면 attendances.length > 0

### 출석 처리

`POST /attendance`

- 지금 시간 기준으로 출석처리
- 만약 하루 이내 출석한 적 있다면 이미 출석했다고 함. (그래도 success는 true)

## 랭킹
`GET /rank`

- 사용자 랭킹을 조회합니다.
- **정렬 우선 순위**: 사용자 포인트, 문제를 푼 횟수, 문제를 올린 횟수 순

| Parameter | Method | Type | Description                  |
| --------- | ------ | ---- | ---------------------------- |
| page      | query  | int  | 페이지 번호 (디폴트 1)       |
| per_page  | query  | int  | 페이지당 문제 수 (디폴트 50) |

## 활동 내역

### 활동 내역 조회

`GET /user/{username}/point-logs`

- 사용자가 받은 포인트 내역을 조회합니다.
| Parameter | Method | Type   | Description                         |
| --------- | ------ | ------ | ----------------------------------- |
| username  | params | string | **Required** 로그인한 사용자 닉네임 |
| page      | query  | int    | 페이지 번호 (디폴트 1)              |
| per_page  | query  | int    | 페이지당 내역 (디폴트 10)           |

```json
200
{
    "success": true,
    "message": "...",
    "attendances": {
        count: 10,
        rows: [
            {
                "content": "가입 기념 포인트",
                "amount": 100,
                "created_at": "..." 
            },
            ...
        ]
    }
}
```

### 제재 내역 조회

`GET /user/{username}/penalty-logs`

- 사용자가 받은 제재 내역을 조회합니다.
| Parameter | Method | Type   | Description                         |
| --------- | ------ | ------ | ----------------------------------- |
| username  | params | string | **Required** 로그인한 사용자 닉네임 |
| page      | query  | int    | 페이지 번호 (디폴트 1)              |
| per_page  | query  | int    | 페이지당 내역 (디폴트 10)           |

```json
200
{
    "success": true,
    "message": "...",
    "attendances": {
        count: 10,
        rows: [
            {
                "content": "제재 사유",
                "termination_date": "...",
                "created_at": "..." 
            },
            ...
        ]
    }
}
```

## 관리자 페이지 관련

### 비공개 문제 목록 조회

`GET /question/blocked`

- 비공개된 상태의 문제만 불러옵니다.

| Parameter          | Method | Type   | Description                                                  |
| ------------------ | ------ | ------ | ------------------------------------------------------------ |
| page               | query  | int    | 페이지 번호 (디폴트 1)                                       |
| per_page           | query  | int    | 페이지당 문제 수 (디폴트 10)                                 |
| course_title       | query  | string | 강의 제목                                                    |
| question_type      | query  | string | 문제 유형 (객관식 multiple_choice, 단답형 short_answer, 서술형 essay 세 유형 중 하나 고를 수 있음) |
| q_question_title   | query  | string | 문제 제목 검색어                                             |
| q_question_content | query  | string | 문제 내용 검색어                                             |
| sort               | query  | string | 정렬 옵션 (컬럼:정렬) (컬럼: id, title, type, content, blocekd, created_at으로 정렬 가능) (정렬: 오름차순 asc, 내림차순 desc) |

### 문제 정보 수정

`PATCH /question/{id}`

- 문제를 수정합니다.
- 현재는 관리자 계정일 때만 사용이 가능합니다.

| Parameter | Method | Type    | Description                                    |
| --------- | ------ | ------- | ---------------------------------------------- |
| blocked   | params | boolean | 해당 문제를 true면 비공개, false면 공개로 전환 |