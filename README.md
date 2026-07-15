# 🏃‍♂️ LocalHub

> **이웃과 함께하는 즐거운 동네 스포츠 매칭 플랫폼**

LocalHub는 동네 이웃들과 함께 러닝, 농구, 축구, 배드민턴 등 다양한 스포츠 모임을 쉽게 찾고 참여할 수 있도록 돕는 위치 기반 생활 체육 매칭 플랫폼입니다.

---

## 🌟 핵심 기능 (Key Features)

- 🗺️ **위치 기반 모임 탐색**: 지도에서 공원, 체육관 등 실제 장소 기반으로 모임을 조회하고, 해당 위치의 날씨 정보를 실시간으로 확인합니다.
- 🤝 **모임 모집 및 참여**: 원하는 종목의 모임을 직접 개설하거나, 관심 있는 모임에 간편하게 참여할 수 있습니다.
- 💬 **실시간 채팅**: 모임 참가자들끼리 전용 채팅방에서 일정과 장소를 조율하며 자유롭게 소통할 수 있습니다.
- 🤖 **AI Sport Mate**: 스포츠 룰 안내부터 눈길을 끄는 모집글 초안 작성까지, 든든한 AI 코치가 챗봇 형태로 도움을 줍니다.

---

## 🛠 사용 기술 스택 (Tech Stack)

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Tailwind CSS
- Vite

### Backend
- Python
- FastAPI

---

## 📸 화면 구성 (Screenshots / UI Preview)

*(아래 주석 처리된 부분에 캡처한 이미지 URL이나 상대 경로를 넣어주세요)*

### 메인 화면 및 지도 (Interactive Map)
<!-- ![메인 지도 화면](./docs/images/map_screenshot.png) -->
- 장소 기반 핀 마커 및 날씨 연동 팝업

### 모임 찾기 및 리스트 (Matches List)
<!-- ![모집글 리스트 화면](./docs/images/matches_screenshot.png) -->
- 카테고리별 모임 검색 및 통계 확인

### 실시간 채팅 (Chat Room)
<!-- ![채팅방 화면](./docs/images/chat_screenshot.png) -->
- 참가자 간 자유로운 일정/장소 조율

### AI 챗봇 서랍 (AI Sport Mate)
<!-- ![AI 챗봇 화면](./docs/images/chatbot_screenshot.png) -->
- 질문 응답 및 모집글 작성 지원

---

## 🚀 설치 및 실행 방법 (Getting Started)

### 1. Repository Clone
```bash
# Frontend
git clone https://github.com/ssafyVCTeam3PJT/localhubFE.git

# Backend
git clone https://github.com/ssafyVCTeam3PJT/localhubBE.git
```

### 2. Frontend 실행 (LocalHub FE)
```bash
cd localhubFE
npm install
# 환경 변수 세팅: .env 파일 생성 (네이버 맵 API, OpenWeather API 등)
npm run dev
```

### 3. Backend 실행 (LocalHub BE)
```bash
cd localhubBE
# 가상 환경 설정 및 패키지 설치
pip install -r requirements.txt
# DB 초기화 및 서버 실행
python -c "from app.main import init_db, load_public_data_places; init_db(); load_public_data_places()"
uvicorn app.main:app --reload
```

---

## 🧑‍🤝‍🧑 팀원 (Team)

- **이정근**
- **유지호**
- **최현준**
