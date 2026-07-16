import { Post, ChatConversation } from "./types";

export const INITIAL_POSTS: Post[] = [
  {
    id: "boramae-running",
    title: "[보라매공원] 저녁 러닝 함께해요!",
    location: "보라매공원",
    address: "서울특별시 동작구 여의대방로20길 33",
    sport: "러닝",
    status: "모집중",
    createdAt: "2시간 전",
    author: "익명",
    views: 128,
    description: "오늘 저녁 6시에 보라매공원 트랙 돌 분 구합니다. 가볍게 5km 정도 뛸 예정입니다. 초보자 환영! 준비물은 개인 러닝화와 생수입니다.",
    tags: ["러닝", "6PM", "초보환영", "보라매공원"],
    joinedCount: 3,
    maxCount: 10,
    lat: 32,
    lng: 41,
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1000",
    comments: [
      {
        id: "c1",
        author: "익명 1",
        content: "저도 참여하고 싶어요! 보라매공원 어디서 모이나요?",
        createdAt: "10분 전"
      },
      {
        id: "c2",
        author: "익명 2",
        content: "트랙 입구 시계탑 앞에서 봬요.",
        createdAt: "5분 전"
      }
    ]
  },
  {
    id: "hanriver-basketball",
    title: "[한강공원] 퇴근 후 캐주얼 5vs5 농구해요",
    location: "반포한강공원 농구장",
    address: "서울특별시 서초구 신반포로11길 144-1",
    sport: "농구",
    status: "모집중",
    createdAt: "어제",
    author: "익명",
    views: 84,
    description: "퇴근 후 가볍게 반포한강공원 농구장에서 반코트나 풀코트 게임 하실 분 구합니다! 실력 상관 없이 재미있게 하실 분 환영합니다.",
    tags: ["농구", "야간농구", "초보가능", "한강공원"],
    joinedCount: 8,
    maxCount: 10,
    lat: 55,
    lng: 65,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000",
    comments: []
  },
  {
    id: "hiking-beginners",
    title: "주말 등산 초보자 모임 (관악산 쉬운 코스)",
    location: "관악산 서울대입구 입구",
    address: "서울특별시 관악구 관악로 1",
    sport: "기타",
    status: "모집중",
    createdAt: "월요일",
    author: "익명",
    views: 156,
    description: "이번 주 토요일 오전에 관악산 둘레길 및 비교적 완만하고 쉬운 코스로 산행 함께하실 분 구해요. 무리하지 않는 속도로 같이 걸어요!",
    tags: ["등산", "주말모임", "초보등산", "관악산"],
    joinedCount: 4,
    maxCount: 6,
    lat: 45,
    lng: 20,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000",
    comments: []
  },
  {
    id: "badminton-doubles",
    title: "[동작구민체육센터] 복식 배드민턴 동료 구합니다",
    location: "동작구민체육센터",
    address: "서울특별시 동작구 여의대방로16길 53",
    sport: "배드민턴",
    status: "모집중",
    createdAt: "10월 12일",
    author: "익명",
    views: 92,
    description: "배드민턴 복식 한두 경기 재미있게 하실 파트너 구합니다. 콕이랑 라켓 가져오시면 됩니다. 코트 비용은 1/N 입니다.",
    tags: ["배드민턴", "복식", "동작구", "체육센터"],
    joinedCount: 1,
    maxCount: 2,
    lat: 68,
    lng: 32,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000",
    comments: []
  }
];

export const INITIAL_CHATS: ChatConversation[] = [
  {
    id: "boramae-running",
    title: "[Boramae Park] Evening Running",
    joinedCount: 3,
    maxCount: 10,
    unreadCount: 2,
    lastMessage: "Are we still meeting at the south entrance?",
    lastTime: "12:45 PM",
    messages: [
      {
        id: "msg1",
        sender: "Post Author",
        text: "안녕하세요! 오늘 8시에 보라매공원 남문에서 뵙는 거 맞죠?",
        time: "19:30",
        isMe: false
      },
      {
        id: "msg2",
        sender: "Anonymous 1 (익명 1)",
        text: "네 맞습니다! 저는 조금 일찍 도착해서 몸 풀고 있을게요.",
        time: "19:32",
        isMe: false
      },
      {
        id: "msg3",
        sender: "Me",
        text: "저도 거의 다 와갑니다. 금방 갈게요!",
        time: "19:35",
        isMe: true
      },
      {
        id: "msg4",
        sender: "Anonymous 2 (익명 2)",
        text: "다들 조심히 오세요~ 날씨가 뛰기 딱 좋네요.",
        time: "19:38",
        isMe: false
      }
    ]
  },
  {
    id: "hanriver-basketball",
    title: "[Han River] Casual Basketball",
    joinedCount: 8,
    maxCount: 10,
    unreadCount: 0,
    lastMessage: "Sounds good, see you guys there!",
    lastTime: "Yesterday",
    messages: [
      {
        id: "msg1",
        sender: "Anonymous 1",
        text: "농구공 가져오시는 분 있나요?",
        time: "17:15",
        isMe: false
      },
      {
        id: "msg2",
        sender: "Me",
        text: "제가 농구공 하나 챙겨갈게요!",
        time: "17:18",
        isMe: true
      },
      {
        id: "msg3",
        sender: "Anonymous 2",
        text: "Sounds good, see you guys there!",
        time: "17:22",
        isMe: false
      }
    ]
  },
  {
    id: "hiking-beginners",
    title: "Weekend Hiking Beginners",
    joinedCount: 4,
    maxCount: 6,
    unreadCount: 1,
    lastMessage: "Does anyone have an extra water bottle?",
    lastTime: "Mon",
    messages: [
      {
        id: "msg1",
        sender: "Anonymous 1",
        text: "이번 주 산행 코스 등산화 필수인가요?",
        time: "11:20",
        isMe: false
      },
      {
        id: "msg2",
        sender: "Post Author",
        text: "일반 편한 운동화나 트레킹화로도 충분히 오르실 수 있습니다!",
        time: "11:25",
        isMe: false
      },
      {
        id: "msg3",
        sender: "Anonymous 2",
        text: "Does anyone have an extra water bottle?",
        time: "13:02",
        isMe: false
      }
    ]
  },
  {
    id: "badminton-doubles",
    title: "[Local Center] Badminton Doubles",
    joinedCount: 1,
    maxCount: 2,
    unreadCount: 0,
    lastMessage: "Thanks for the game! Let's play again soon.",
    lastTime: "Oct 12",
    messages: [
      {
        id: "msg1",
        sender: "Post Author",
        text: "오늘 고생 많으셨습니다!",
        time: "20:00",
        isMe: false
      },
      {
        id: "msg2",
        sender: "Me",
        text: "Thanks for the game! Let's play again soon.",
        time: "20:05",
        isMe: true
      }
    ]
  }
];
