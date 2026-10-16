# 일본어 단어장 (JLPT N5)

폰에서 보는 JLPT N5 단어 플래시카드 + 4지선다 문제 + 오답률 기반 복습 앱입니다.

- 구간(20개씩) 선택 → 플래시카드 → 문제풀이
- 정답/오답은 기기에 먼저 저장하고, 온라인일 때 Postgres로 동기화해요 (오프라인에서도 풀 수 있어요)
- 오답노트: 오답률이 높은 단어부터 출제하고, 연속 3번 맞히면 빠져요
- 로그인 없음 (기록은 하나의 공용 세트). 로그인을 붙일 때를 위해 `Attempt.userId` 칸을 두었어요.

## 개발

```bash
npm install
neon deploy            # Neon 브랜치 적용 + .env.local에 DATABASE_URL 받기
npm run db:push
npm run dev
```

`DATABASE_URL`이 없어도 앱은 동작하고, 기록이 기기에만 저장돼요.

## Vercel 배포

1. 이 저장소를 Vercel에 import
2. Storage 탭에서 Neon(Postgres)을 연결 → `DATABASE_URL`이 자동 설정돼요 (`POSTGRES_PRISMA_URL`만 생기면 `DATABASE_URL`로 같은 값을 추가)
3. 로컬에서 한 번 `DATABASE_URL`을 Vercel 값으로 두고 `npx prisma db push`로 테이블 생성
4. 폰 브라우저에서 열고 "홈 화면에 추가"

## 단어 추가

`src/data/n5.ts`의 맨 뒤에 `단어|읽기|뜻` 한 줄씩 추가하세요. 중간에 끼워 넣으면 기존 기록의 단어 id가 밀려요.
