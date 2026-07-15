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

### 메인 화면 및 지도 (Interactive Map)
<img width="2560" height="1346" alt="스크린샷 2026-07-15 143714" src="https://github.com/user-attachments/assets/953b2e1c-a1b0-452b-bbc7-c30e53dedcde" />
<img width="2560" height="1354" alt="스크린샷 2026-07-15 144500" src="https://github.com/user-attachments/assets/fcd58922-3c3c-4065-8e19-efd75cac4521" />
- 장소 기반 핀 마커 및 날씨 연동 팝업

<br>

### 모임 찾기 및 리스트 (Matches List)
<img width="2560" height="1349" alt="스크린샷 2026-07-15 144514" src="https://github.com/user-attachments/assets/e4704439-dde5-49ae-95d3-7acf1799a3f2" />
<img width="2560" height="1346" alt="스크린샷 2026-07-15 144508" src="https://github.com/user-attachments/assets/7c13529b-622a-49be-881d-b8dde2c721a6" />
<img width="2558" height="1351" alt="image" src="https://github.com/user-attachments/assets/8c45cce2-aeff-4cab-a118-151724d22fb6" />


- 카테고리별 모임 검색 및 통계 확인



### AI 챗봇 서랍 (AI Sport Mate)
<img width="2559" height="1347" alt="image" src="https://github.com/user-attachments/assets/d70f8f1e-fe40-4b54-a921-db2713645db4" />

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
