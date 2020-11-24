## Authentication

### POST /auth/register

| 에러 코드 (error)      | 의미                                             |
| ---------------------- | ------------------------------------------------ |
| formFieldsEmpty        | 양식이 비어있을 경우                             |
| userExistsWithEmail    | 이미 동일한 이메일로 가입한 사용자가 있을 경우   |
| userExistsWithUsername | 이미 동일한 닉네임으로 가입한 사용자가 있을 경우 |
| registerFails          | 그 외의 상황에서 실패한 경우                     |

### POST /auth/login

| 에러 코드 (error) | 의미                                           |
| ----------------- | ---------------------------------------------- |
| userNotExists     | 해당 이메일을 가진 사용자가 존재하지 않을 경우 |
| authFails         | 비밀번호가 일치하지 않을 경우                  |
| loginFails        | 그 외의 상황에서 실패한 경우                   |

### POST /auth/logout

| 에러 코드 (error)  | 의미                                                        |
| ------------------ | ----------------------------------------------------------- |
| userNotLoggedIn    | 사용자가 로그인 되어 있지 않은 경우                         |
| tokenDeletionFails | 서버에 토큰이 존재하지 않는 등 그 외의 상황에서 실패한 경우 |

### POST /auth/send-verification-email

| 에러 코드 (error)          | 의미                                         |
| -------------------------- | -------------------------------------------- |
| userNotLoggedIn            | 사용자가 로그인 되어 있지 않은 경우          |
| userAlreadyEmailVerified   | 사용자가 이미 이메일 인증을 받았을 경우      |
| verificationEmailSendFails | 사용자 인증 이메일을 보내는 데 실패했을 경우 |

### POST /auth/verify-email

| 에러 코드 (error)          | 의미                                       |
| -------------------------- | ------------------------------------------ |
| userAlreadyEmailVerified   | 사용자가 이미 이메일 인증을 받았을 경우    |
| verificationCodeExpires    | 인증 코드 만료 시간이 지났을 경우          |
| verificationCodeMismatches | 인증 코드가 일치하지 않을 경우             |
| emailVerificationFails     | 그 외의 상황에서 가입 인증에 실패했을 경우 |



## /subject, /course, /question

| 에러 코드 (error)           | 의미                                                         |
| --------------------------- | ------------------------------------------------------------ |
| entryNotExists              | 해당 entry가 존재하지 않을 경우                              |
| entryAlreadyExists          | 해당 내용의 entry가 이미 존재할 경우                         |
| contentNotEnough            | 내용이 부족할 경우                                           |
| userMismatches              | 로그인한 사용자가 해당 entry의 소유자가 아닐 경우            |
| requestFails                | 그 외의 상황에서 실패했을 경우                               |
| notEnoughPoint              | 사용자가 문제를 조회하기 위한 포인트가 부족할 경우 (읽을 때마다 1씩 차감) |
| questionTypeInvalid         | 문제 유형이 올바르지 않은 경우                               |
| multipleChoiceItemsNotGiven | 객관식 유형 문제의 보기가 없을 경우                          |
| shortAnswerItemsNotGiven    | 주관식 유형 문제의 정답 예시가 없을 경우                     |
| queriesEmpty                | req.query로 들어오는 쿼리가 비어 있을 때                     |
| parametersEmpty             | req.params로 들어오는 파라미터가 비어 있을 때                |

# Other Functions

### validateJwt

| 에러 코드 (error)             | 의미                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| refreshTokenDiffersFromServer | refresh token이 서버에 있는 refresh token과 내용이 다를 경우, 해킹 시도로 간주 |
| tokenValidationFails          | access token 인증에 실패한 경우                              |
| tokenNotExists                | access token, refresh token 둘 중 하나라도 존재하지 않는 경우 |

### isLoggedIn

| 에러 코드 (error)    | 의미                                    |
| -------------------- | --------------------------------------- |
| userNotEmailVerified | 사용자가 이메일 인증을 받지 않았을 경우 |
| userNotActive        | 사용자가 정지 상태일 경우               |
| userNotLoggedIn      | 기타 상황에서 로그인 되어있지 않은 경우 |

- 그 외 에러는 validateJwt에서 메세지를 가져온다.