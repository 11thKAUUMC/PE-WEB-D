# 8주차 미션 기록

`.env.local`에서 TMDB 토큰과 백엔드 주소를 설정한 뒤 PowerShell에서 `pnpm.cmd dev`로 화면을 연다. 로컬 백엔드는 별도 터미널에서 실행한다. 주소를 변경한 경우 Vite를 다시 시작한다.

## 필수 미션

| 항목 | 남길 핵심 코드 | 캡처할 최종 화면 |
| --- | --- | --- |
| 로그인 전용 폴더 | `src/routes/(authenticated)/_auth.tsx`의 `beforeLoad`, `src/components/layout/auth-layout.tsx`의 `Outlet` | 에디터에서 `(authenticated)` 폴더와 하위 라우트가 보이는 화면. 로그아웃 상태에서 `/mypage/edit`를 열어 `/login`으로 이동한 화면. 로그인 후 마이페이지 및 수정 폼이 열리는 화면. |
| 마이페이지 즐겨찾기 | `src/hooks/use-favorites.ts`의 `useFavorites` | 영화 한 편을 즐겨찾기한 다음 `/mypage`에 해당 영화가 보이는 화면과 Network의 `GET /favorites` 성공 행. |
| 영화 상세 즐겨찾기 | `src/api/favorites.ts` 및 `useMovieFavorite`의 변경 후 처리 | 상세에서 `GET /favorites/{movieId}`로 초기 버튼 상태를 확인한 뒤, 추가와 해제를 각각 실행해 버튼이 바뀐 화면. Network에서 `POST /favorites`와 `DELETE /favorites/{movieId}`의 성공 상태가 보이게 캡처. |
| 영화 상세 평점 | `src/api/ratings.ts`의 회원 평점 조회와 변경 함수, `MovieRatingPanel`의 무효화 | 4점과 후기를 등록한 화면, 5점으로 수정한 화면, 삭제 후 등록 버튼으로 돌아온 화면. Network에서 회원 평점 GET과 평점 POST, PATCH, DELETE 성공 행을 함께 확인. |

## 워크북 실습

- 회원가입 성공 안내 뒤 로그인 페이지가 열린 화면과 `POST /members` 성공 행.
- 로그인 성공 뒤 홈과 헤더의 마이페이지 링크가 보이는 화면. Network에서 `POST /auth/login`과 `GET /members/me`를 확인. 잘못된 비밀번호의 실패 안내와 로그인 상태에서 `/login`을 열었을 때 홈으로 돌아가는 동작도 확인.
- 닉네임 수정 직전에 Network를 비우고 저장한 뒤, 새 닉네임과 `PATCH /members/me` 성공 행을 함께 캡처. 저장 직후 캐시 갱신을 위한 별도 GET이 생기는지 확인.
- 페이지 이동 시 Network 기록을 유지하려면 **Preserve log**를 켠다. Method와 Status 열을 표시한다. 토큰, Authorization 헤더, 비밀번호가 보이는 화면은 캡처에서 제외한다.

## 선택 미션

- 평점은 변경 성공 후 `invalidateQueries`로 활성 조회를 다시 실행한다. 등록·수정·삭제 중 하나를 수행하고 변경 요청에 이어 회원 평점 GET이 발생한 Network 화면을 남긴다.
- 닉네임은 성공 응답의 `result`를 `setQueryData`로 저장한다. 닉네임 수정 캡처를 함께 첨부하고, 서버 결과를 그대로 받았을 때는 응답으로 바로 갱신할 수 있고 최종 응답에 필요한 데이터가 없으면 다시 조회할 수 있다고 기록한다.
- 로그인, 회원가입, 즐겨찾기 훅에서 `mutationOptions`를 선언한 부분과 `useMutation`에 적용하는 부분을 짧게 첨부한다.

## 핵심 키워드와 후기 초안

- 입력값은 폼 상태로 관리한다. 토큰은 로그인 세션에서 사용하므로 Zustand에 보관한다. 회원 정보의 원본은 서버에 있고 조회 결과는 Query 캐시에 둔다. 회원 정보를 store에도 복제하면 닉네임을 수정한 뒤 한쪽에 예전 값이 남을 수 있다.
- 캐시 일관성은 여러 화면에서 같은 조회 결과를 사용할 때 중요하다. 정확한 수정 결과가 응답에 있으면 해당 캐시를 바로 바꿀 수 있다. 현재 목록 구성이나 변경 후 결과를 서버에서 다시 계산해야 하면 무효화 후 재조회한다.
- 학습 후기 초안 — 회원가입 폼에서 요청 중 상태를 직접 관리하던 코드를 mutation 상태로 대체했다. 닉네임 수정과 평점 수정에 서로 다른 캐시 갱신 방식을 적용하면서 성공 응답에 어떤 값이 있는지에 따라 후속 조회 여부를 정할 수 있다는 점을 배웠다. 실제 확인 결과를 덧붙인다.

## 서버 확인이 필요한 항목

로컬 `../movie` 백엔드에 HTTP로 직접 요청해 회원가입 201, 잘못된 비밀번호 401, 로그인 200, 내 정보 조회·수정 200, 평점 등록 201 및 조회·수정·삭제 200을 확인했다. 평점 재조회로 4점 등록, 5점 수정, 삭제 결과도 확인했다. 브라우저 캡처는 위 순서대로 진행한다.

같은 백엔드의 `GET /favorites`는 404를 반환했다. 즐겨찾기 코드는 목록의 각 항목에 `movieId`가 있고, 상세 조회에서 불리언 또는 `{ isFavorite: boolean }`이 오며, 추가할 때 `{ movieId }`를 보낸다고 가정한다. 즐겨찾기 API가 구현된 서버의 주소를 `.env.local`의 `VITE_API_BASE_URL`에 설정하고 성공 응답을 확인한 뒤 해당 미션의 캡처를 남긴다.
