# selftest-backend

## 서버 셋업

### MariaDB 설치

- 링크 참고: https://jhnyang.tistory.com/257

### Redis 설치 (로그인/로그아웃 구현)

- 윈도우는 비공식 지원
- GitHub 저장소에서 release (stable) 중 .msi 파일 다운로드 받으면 됨
- 링크 참고: https://gofnrk.tistory.com/35?category=768900

### 프로젝트 모듈 설치

- 명령창에서 실행

```sh
npm install
```

### .env 파일 생성

- 프로젝트 루트 경로 (app.js 옆에)에 `.env` 파일을 만들고 내용물로 다음과 같이 한다.

```
COOKIE_SECRET=selftestdevsecret
SEQUELIZE_PASSWORD=MariaDB 루트 패스워드
JWT_SECRET=selftesttokensecret
REDIS_HOST=localhost
REDIS_PASSWORD=6379
VERIFICATION_EMAIL=SelfTest 인증용 이메일
VERIFICATION_EMAIL_PASSWORD=SelftTest 인증용 이메일 비밀번호
```

- `MariaDB 루트 패스워드` 부분에 본인이 설정한 패스워드 입력하고 저장하면 된다.

### DB 셋업

- DB 생성 (`selftest-dev`)

```sh
npx sequelize db:create
```

- 테이블 생성은 `npm start` (서버 시작) 할 때마다 자동으로 실행됨.
- 단, 스키마 변동사항 있을 때는 `selftest-dev` DB를 drop 해주고 DB 생성부터 진행하면 됨.

## 서버 시작

```sh
npm start
```
