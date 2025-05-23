### REST API Endpoints and Base Paths

The application registers all routers under the following prefixes:

```js
app.use("/report", reportRoutes);
app.use("/auth", authRoutes);
app.use("/word", wordRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/analytics", analyticsRoutes);
```

Below is a summary of all routes in the context of these base prefixes. The **Full Path** column combines the HTTP Method, base prefix, and specific endpoint.

| HTTP Method | Base Path    | Endpoint               | Full Path                         | Middleware                                                                         | Controller Function        | Description                                  |
| ----------- | ------------ | ---------------------- | --------------------------------- | ---------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------- |
| POST        | `/auth`      | `/register`            | `POST /auth/register`             | `registerValidator`, `catchAsync`                                                  | `registerUser`             | Registers a new user                         |
| POST        | `/auth`      | `/login`               | `POST /auth/login`                | `loginRateLimiter`, `loginValidator`, `catchAsync`                                 | `loginUser`                | Logs in a user and returns a token           |
| POST        | `/auth`      | `/logout`              | `POST /auth/logout`               | `authenticateToken`, `catchAsync`                                                  | `logoutUser`               | Logs out a user                              |
| GET         | `/auth`      | `/admin`               | `GET /auth/admin`                 | `authenticateToken`, `authorizeAdmin`, `catchAsync`                                | `adminWelcome`             | Admin welcome message                        |
| GET         | `/auth`      | `/user`                | `GET /auth/user`                  | `authenticateToken`, `catchAsync`                                                  | `userWelcome`              | User welcome message                         |
| POST        | `/auth`      | `/information`         | `POST /auth/information`          | `authenticateToken`, `getUserInformationValidator`, `catchAsync`                   | `userInformation`          | Retrieves user account information           |
| GET         | `/auth`      | `/requirements`        | `GET /auth/requirements`          | `catchAsync`                                                                       | `getRequirements`          | Returns application requirements             |
| PATCH       | `/auth`      | `/update`              | `PATCH /auth/update`              | `authenticateToken`, `accountUpdateValidationRules`, `catchAsync`                  | `updateUserAccount`        | Updates user account details                 |
| DELETE      | `/auth`      | `/delete`              | `DELETE /auth/delete`             | `authenticateToken`, `deleteUserValidator`, `catchAsync`                           | `deleteUserAccount`        | Deletes a user account                       |
| POST        | `/auth`      | `/send-reset-link`     | `POST /auth/send-reset-link`      | `resetPasswordLinkValidationRules`, `catchAsync`                                   | `sendUserResetLink`        | Sends password reset link                    |
| POST        | `/auth`      | `/reset-password`      | `POST /auth/reset-password`       | `resetPasswordValidationRules`, `catchAsync`                                       | `resetPassword`            | Resets user password                         |
| GET         | `/admin`     | `/global-data`         | `GET /admin/global-data`          | `authenticateToken`, `authorizeAdmin`, `catchAsync`                                | `getGlobalData`            | Retrieves global administrative data         |
| GET         | `/admin`     | `/visits-data`         | `GET /admin/visits-data`          | `authenticateToken`, `authorizeAdmin`, `catchAsync`                                | `getVisitsData`            | Retrieves site visits data                   |
| GET         | `/admin`     | `/user-activity-data`  | `GET /admin/user-activity-data`   | `authenticateToken`, `authorizeAdmin`, `catchAsync`                                | `getUserActivityData`      | Retrieves user activity data                 |
| POST        | `/admin`     | `/generatepatch`       | `POST /admin/generatepatch`       | `authenticateToken`, `authorizeAdmin`, `verifyPin`, `catchAsync`                   | `generatePatches`          | Generates new patches after PIN verification |
| POST        | `/report`    | `/details`             | `POST /report/details`            | `authenticateToken`, `authorizeAdmin`, `getDetailReportValidator`, `catchAsync`    | `getDetailReport`          | Retrieves report details (admin)             |
| GET         | `/report`    | `/data`                | `GET /report/data`                | `authenticateToken`, `authorizeAdmin`, `catchAsync`                                | `getDataReports`           | Retrieves all report data (admin)            |
| PATCH       | `/report`    | `/update`              | `PATCH /report/update`            | `authenticateToken`, `authorizeAdmin`, `updateReportValidator`, `catchAsync`       | `updateReportTranslations` | Updates report translations (admin)          |
| DELETE      | `/report`    | `/delete/:id`          | `DELETE /report/delete/:id`       | `authenticateToken`, `authorizeAdmin`, `deleteReportValidator`, `catchAsync`       | `deleteReportData`         | Deletes a report by ID (admin)               |
| POST        | `/report`    | `/add`                 | `POST /report/add`                | `authenticateToken`, `authorizeAddReport`, `catchAsync`                            | `createReport`             | Creates a new report (admin)                 |
| GET         | `/user`      | `/list`                | `GET /user/list`                  | `authenticateToken`, `authorizeAdmin`, `catchAsync`                                | `getUsersList`             | Retrieves list of users (admin)              |
| PATCH       | `/user`      | `/update`              | `PATCH /user/update`              | `authenticateToken`, `authorizeAdmin`, `updateUsersValidator`, `catchAsync`        | `updateUsers`              | Updates user data (admin)                    |
| GET         | `/user`      | `/search`              | `GET /user/search`                | `authenticateToken`, `authorizeAdmin`, `catchAsync`                                | `searchUsers`              | Searches users by query params               |
| POST        | `/user`      | `/learn-word`          | `POST /user/learn-word`           | `authenticateToken`, `learnWordValidator`, `catchAsync`                            | `learnWord`                | Records word learning for user               |
| DELETE      | `/user`      | `/delete/:id`          | `DELETE /user/delete/:id`         | `authenticateToken`, `authorizeAdmin`, `deleteUserValidator`, `catchAsync`         | `deleteUser`               | Deletes a user by ID (admin)                 |
| POST        | `/user`      | `/auto-save`           | `POST /user/auto-save`            | `authenticateToken`, `autoSaveValidator`, `catchAsync`                             | `autoSave`                 | Automatically saves user state               |
| POST        | `/user`      | `/auto-load`           | `POST /user/auto-load`            | `authenticateToken`, `catchAsync`                                                  | `autoLoad`                 | Automatically loads user state               |
| POST        | `/user`      | `/auto-delete`         | `POST /user/auto-delete`          | `authenticateToken`, `catchAsync`                                                  | `autoDelete`               | Automatically deletes user state             |
| GET         | `/user`      | `/ranking-flashcard`   | `GET /user/ranking-flashcard`     | `catchAsync`                                                                       | `getRankingFlashcard`      | Retrieves flashcard rankings                 |
| GET         | `/user`      | `/ranking-arena`       | `GET /user/ranking-arena`         | `catchAsync`                                                                       | `getArena`                 | Retrieves arena rankings                     |
| POST        | `/word`      | `/data`                | `POST /word/data`                 | `authorizeData`, `catchAsync`                                                      | `getWordData`              | Retrieves word data based on request payload |
| POST        | `/word`      | `/patch-data`          | `POST /word/patch-data`           | `authorizePatchAndLevel`, `catchAsync`                                             | `getWordsByPatchAndLevel`  | Retrieves words by patch and level           |
| GET         | `/word`      | `/patch-info`          | `GET /word/patch-info`            | `catchAsync`                                                                       | `getPatchesInfo`           | Returns available patch information          |
| GET         | `/word`      | `/ranking-word`        | `GET /word/ranking-word`          | `authenticateToken`, `catchAsync`                                                  | `getRankingWord`           | Retrieves word rankings based on token       |
| GET         | `/word`      | `/random-words`        | `GET /word/random-words`          | `catchAsync`                                                                       | `getRandomWords`           | Returns random words                         |
| GET         | `/word`      | `/history`             | `GET /word/history`               | `authenticateToken`, `catchAsync`                                                  | `getRankingHistory`        | Returns ranking history                      |
| POST        | `/word`      | `/submit-answer`       | `POST /word/submit-answer`        | `authenticateToken`, `catchAsync`                                                  | `submitAnswer`             | Submits user answer and returns result       |
| GET         | `/word`      | `/list`                | `GET /word/list`                  | `authenticateToken`, `authorizeAdmin`, `authorizeList`, `catchAsync`               | `getWordsList`             | Retrieves list of words (admin)              |
| POST        | `/word`      | `/detail`              | `POST /word/detail`               | `authenticateToken`, `authorizeAdmin`, `getWordDetailValidator`, `catchAsync`      | `getWordDetail`            | Retrieves detailed word data (admin)         |
| PATCH       | `/word`      | `/update-translations` | `PATCH /word/update-translations` | `authenticateToken`, `authorizeAdmin`, `updateTranslationsValidator`, `catchAsync` | `updateWordTranslations`   | Updates word translations (admin)            |
| GET         | `/word`      | `/search`              | `GET /word/search`                | `authenticateToken`, `authorizeAdmin`, `catchAsync`                                | `searchWords`              | Searches words based on query parameters     |
| POST        | `/word`      | `/add`                 | `POST /word/add`                  | `authenticateToken`, `authorizeAdmin`, `addWordValidator`, `catchAsync`            | `addWord`                  | Adds a new word (admin)                      |
| DELETE      | `/word`      | `/delete/:id`          | `DELETE /word/delete/:id`         | `authenticateToken`, `authorizeAdmin`, `deleteWordValidator`, `catchAsync`         | `deleteWord`               | Deletes a word by ID (admin)                 |
| POST        | `/analytics` | `/visit`               | `POST /analytics/visit`           | `pageNameValidator`, `catchAsync`                                                  | `countingEntries`          | Counts page visits for analytics             |
