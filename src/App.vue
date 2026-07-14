<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Navbar from "./components/Navbar.vue";
import InteractiveMap from "./components/InteractiveMap.vue";
import PostDetail from "./components/PostDetail.vue";
import ChatList from "./components/ChatList.vue";
import ChatRoom from "./components/ChatRoom.vue";
import MatchesList from "./components/MatchesList.vue";
import CreateMatchModal from "./components/CreateMatchModal.vue";
import AICompanionDrawer from "./components/AICompanionDrawer.vue";
import type { Post, ChatConversation, Comment } from "./types";
import { INITIAL_POSTS, INITIAL_CHATS } from "./initialData";
import { fetchPosts, fetchPostById, addComment, joinPost, viewPost, createPost as createBackendPost } from "./api";
import { Compass, Users, MessageSquare, Bell, Check, X } from "lucide-vue-next";

// Navigation State
const activeTab = ref<"explore" | "matches" | "chat">("explore");

// Data State
const posts = ref<Post[]>(INITIAL_POSTS);
const chats = ref<ChatConversation[]>(INITIAL_CHATS);
const isLoadingPosts = ref(false);
const postsError = ref<string | null>(null);
const isDetailLoading = ref(false);
const detailError = ref<string | null>(null);

// User Profile Join status
const joinedPostIds = ref<string[]>([]);

// Selection states
const selectedPost = ref<Post | null>(null);
const activeChatId = ref<string | null>(null);

// Open states
const isCreateModalOpen = ref(false);
const isAIDrawerOpen = ref(false);
const createModalInitialLocation = ref<string | null>(null);

// Notification States
const toastMessage = ref<string | null>(null);
const showNotificationPopup = ref(false);
const profileOpen = ref(false);

// Trigger Toast
const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = null;
  }, 3000);
};

const loadPosts = async () => {
  isLoadingPosts.value = true;
  postsError.value = null;

  try {
    const backendPosts = await fetchPosts();
    posts.value = backendPosts;
  } catch (error) {
    postsError.value = error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.";
    posts.value = INITIAL_POSTS;
  } finally {
    isLoadingPosts.value = false;
  }
};

onMounted(() => {
  void loadPosts();
});

// Add Comment
const handleAddComment = async (postId: string, content: string) => {
  try {
    const comment = await addComment(postId, content);

    posts.value = posts.value.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, comment]
        };
      }
      return p;
    });

    if (selectedPost.value && selectedPost.value.id === postId) {
      selectedPost.value = {
        ...selectedPost.value,
        comments: [...selectedPost.value.comments, comment]
      };
    }

    triggerToast("댓글이 등록되었습니다!");
  } catch (error) {
    triggerToast(error instanceof Error ? error.message : "댓글 등록에 실패했습니다.");
  }
};

// Join Match
const handleJoinPost = async (post: Post) => {
  if (joinedPostIds.value.includes(post.id)) return;

  try {
    const result = await joinPost(post.id);

    joinedPostIds.value.push(post.id);

    const chatExists = chats.value.some((c) => c.id === post.id);
    if (!chatExists) {
      const newChat: ChatConversation = {
        id: post.id,
        title: post.title,
        joinedCount: result.joinedCount,
        maxCount: post.maxCount,
        unreadCount: 0,
        lastMessage: "모임에 참가하신 것을 환영합니다! 자유롭게 대화해 보세요.",
        lastTime: "방금 전",
        messages: [
          {
            id: `msg-welcome-${Date.now()}`,
            sender: "System",
            text: "모임에 성공적으로 합류하셨습니다! 따뜻하고 안전한 대화를 나눠보세요.",
            time: "방금 전",
            isMe: false
          }
        ]
      };
      chats.value = [newChat, ...chats.value];
    } else {
      chats.value = chats.value.map((c) => {
        if (c.id === post.id) {
          return {
            ...c,
            joinedCount: result.joinedCount
          };
        }
        return c;
      });
    }

    posts.value = posts.value.map((p) => {
      if (p.id === post.id) {
        return {
          ...p,
          joinedCount: result.joinedCount
        };
      }
      return p;
    });

    if (selectedPost.value?.id === post.id) {
      selectedPost.value = {
        ...selectedPost.value,
        joinedCount: result.joinedCount
      };
    }

    triggerToast(`"${post.title}" 모임 가입 완료!`);
  } catch (error) {
    triggerToast(error instanceof Error ? error.message : "참여 처리에 실패했습니다.");
  }
};

const openPostDetail = async (post: Post) => {
  detailError.value = null;
  isDetailLoading.value = true;

  try {
    const freshPost = await fetchPostById(post.id);
    selectedPost.value = freshPost;
    await viewPost(post.id);
  } catch (error) {
    detailError.value = error instanceof Error ? error.message : "상세 정보를 불러오지 못했습니다.";
    selectedPost.value = post;
  } finally {
    isDetailLoading.value = false;
  }
};

// Go to Chatroom from Detail
const handleGoToChat = (postId: string) => {
  selectedPost.value = null; // Close post detail
  activeTab.value = "chat"; // Switch tab
  activeChatId.value = postId; // Select active chat
};

// Send message in ChatRoom
const handleSendMessage = (chatId: string, text: string) => {
  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  
  const newMsg = {
    id: `msg-${Date.now()}`,
    sender: "Me",
    text,
    time: timeString,
    isMe: true
  };

  chats.value = chats.value.map((c) => {
    if (c.id === chatId) {
      return {
        ...c,
        lastMessage: text,
        lastTime: timeString,
        messages: [...c.messages, newMsg]
      };
    }
    return c;
  });
};

// Create New Post
const handleOpenCreateModal = (locationName?: string | null) => {
  createModalInitialLocation.value = locationName ?? null;
  isCreateModalOpen.value = true;
};

const closeCreateModal = () => {
  isCreateModalOpen.value = false;
  createModalInitialLocation.value = null;
};

const handleCreatePost = async (newPostData: Partial<Post>) => {
  try {
    const createdPost = await createBackendPost(newPostData);

    posts.value = [createdPost, ...posts.value];
    joinedPostIds.value.push(createdPost.id);

    const newChat: ChatConversation = {
      id: createdPost.id,
      title: createdPost.title,
      joinedCount: createdPost.joinedCount,
      maxCount: createdPost.maxCount,
      unreadCount: 0,
      lastMessage: "모임이 방금 개설되었습니다.",
      lastTime: "방금 전",
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: "System",
          text: "모임이 개설되었습니다. 다른 멤버가 참가하면 실시간 채팅을 나눌 수 있습니다!",
          time: "방금 전",
          isMe: false
        }
      ]
    };
    chats.value = [newChat, ...chats.value];

    isCreateModalOpen.value = false;
    triggerToast("새로운 모임글이 성공적으로 개설되었습니다!");
  } catch (error) {
    triggerToast(error instanceof Error ? error.message : "모임 생성에 실패했습니다.");
  }
};

// Count unread chats
const totalUnread = computed(() => {
  return chats.value.reduce((acc, c) => acc + c.unreadCount, 0);
});

const handleTabChange = (tab: "explore" | "matches" | "chat") => {
  activeTab.value = tab;
  // Auto reset sub-selections when tab shifts
  if (tab !== "chat") activeChatId.value = null;
  if (tab !== "explore") selectedPost.value = null;
};
</script>

<template>
  <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-gray-800 font-sans">
    
    <!-- Header Navigation shell -->
    <Navbar
      :activeTab="activeTab"
      @tabChange="handleTabChange"
      @profileClick="profileOpen = true"
      @notificationsClick="showNotificationPopup = true"
      :unreadCount="totalUnread"
    />

    <!-- Main Content viewport -->
    <main className="flex-1 w-full relative overflow-hidden flex">
      
      <!-- Tab 1: Explore Map View -->
      <div v-if="activeTab === 'explore'" className="w-full h-full flex flex-col md:flex-row relative">
        <!-- If a post is selected, show detail screen -->
        <div v-if="selectedPost" className="w-full h-full md:w-[480px] lg:w-[550px] bg-white border-r border-gray-100 z-10 shadow-lg">
          <PostDetail
            :post="selectedPost"
            :isJoined="joinedPostIds.includes(selectedPost.id)"
            :isLoading="isDetailLoading"
            :error="detailError"
            @back="selectedPost = null"
            @join="handleJoinPost(selectedPost)"
            @goToChat="handleGoToChat(selectedPost.id)"
            @addComment="handleAddComment"
          />
        </div>

        <!-- Map -->
        <div className="flex-1 h-full relative">
          <InteractiveMap
            :posts="posts"
            @selectPost="(post) => openPostDetail(post)"
            @openCreateModal="(locationName) => handleOpenCreateModal(locationName)"
            @openAIDrawer="isAIDrawerOpen = true"
          />
        </div>
      </div>

      <!-- Tab 2: Matches Listing / Dashboard View -->
      <div v-else-if="activeTab === 'matches'" className="w-full h-full flex justify-center bg-gray-50/50">
        <div v-if="selectedPost" className="w-full max-w-[720px] bg-white shadow-md h-full">
          <PostDetail
            :post="selectedPost"
            :isJoined="joinedPostIds.includes(selectedPost.id)"
            :isLoading="isDetailLoading"
            :error="detailError"
            @back="selectedPost = null"
            @join="handleJoinPost(selectedPost)"
            @goToChat="handleGoToChat(selectedPost.id)"
            @addComment="handleAddComment"
          />
        </div>
        <div v-else className="w-full h-full">
          <MatchesList
            :posts="posts"
            :joinedPostIds="joinedPostIds"
            @selectPost="(post) => openPostDetail(post)"
            @openCreateModal="isCreateModalOpen = true"
          />
        </div>
      </div>

      <!-- Tab 3: Chat Tab -->
      <div v-else-if="activeTab === 'chat'" className="w-full h-full flex">
        <!-- Conversations list -->
        <div :className="`w-full md:w-[360px] lg:w-[420px] border-r border-gray-100 h-full flex flex-col shrink-0 ${
          activeChatId ? 'hidden md:flex' : 'flex'
        }`">
          <ChatList
            :conversations="chats"
            @selectChat="(id) => {
              activeChatId = id;
              chats = chats.map(c => c.id === id ? { ...c, unreadCount: 0 } : c);
            }"
            :activeChatId="activeChatId"
          />
        </div>

        <!-- Active chatroom dialog -->
        <div :className="`flex-1 h-full ${
          activeChatId ? 'flex' : 'hidden md:flex items-center justify-center bg-slate-50 text-gray-400 text-sm'
        }`">
          <template v-if="activeChatId">
            <ChatRoom
              v-if="chats.find(c => c.id === activeChatId)"
              :chat="chats.find(c => c.id === activeChatId)!"
              @back="activeChatId = null"
              @sendMessage="handleSendMessage"
            />
          </template>
          <div v-else className="text-center">
            <MessageSquare :size="48" className="mx-auto mb-3 text-gray-300" />
            대화할 채팅방을 선택해 주세요.
          </div>
        </div>
      </div>

    </main>

    <!-- Floating toast notification snackbar -->
    <div v-if="toastMessage" className="fixed bottom-20 md:bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-xs text-white text-xs font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
      <Check :size="14" className="text-[#10b981]" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Profile Sidebar/Modal overlay -->
    <div v-if="profileOpen" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
        <div className="flex justify-between items-start">
          <h3 className="font-headline-md text-base font-bold text-gray-900">내 프로필</h3>
          <button @click="profileOpen = false" className="text-gray-400 hover:text-gray-600">
            <X :size="18" />
          </button>
        </div>
        
        <div className="flex flex-col items-center text-center py-6 border-b border-gray-50">
          <div className="w-16 h-16 bg-[#006c49]/10 text-[#006c49] text-xl font-bold rounded-full flex items-center justify-center mb-3">
            U
          </div>
          <h4 className="font-bold text-gray-900 text-base">User8429</h4>
          <p className="text-xs text-gray-500 mt-0.5">서울특별시 동작구</p>
          
          <div className="flex gap-4 mt-4 text-xs font-bold">
            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="block text-gray-400">가입 모임</span>
              <span className="text-[#006c49] text-sm mt-0.5 block">{{ joinedPostIds.length }}개</span>
            </div>
            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="block text-gray-400">매너 온도</span>
              <span className="text-[#10b981] text-sm mt-0.5 block">36.5°C</span>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <button
            @click="() => {
              profileOpen = false;
              activeTab = 'matches';
              selectedPost = null;
            }"
            className="w-full text-left font-bold text-xs text-gray-700 hover:bg-gray-50 p-2.5 rounded-xl transition-colors"
          >
            📅 가입한 스포츠 매치 일정 조회
          </button>
          <button
            @click="() => {
              profileOpen = false;
              isCreateModalOpen = true;
            }"
            className="w-full text-left font-bold text-xs text-[#006c49] hover:bg-emerald-50 p-2.5 rounded-xl transition-colors"
          >
            ➕ 새로운 동네 모임 개설
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications Sidebar/Modal overlay -->
    <div v-if="showNotificationPopup" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
        <div className="flex justify-between items-start border-b border-gray-50 pb-3">
          <h3 className="font-headline-md text-base font-bold text-gray-900 flex items-center gap-1.5">
            <Bell :size="18" className="text-[#006c49]" />
            알림 센터
          </h3>
          <button @click="showNotificationPopup = false" className="text-gray-400 hover:text-gray-600">
            <X :size="18" />
          </button>
        </div>
        
        <div className="py-4 space-y-3.5 max-h-[260px] overflow-y-auto">
          <div className="flex items-start gap-2 text-xs bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/30">
            <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full shrink-0 mt-1.5"></span>
            <div>
              <p className="font-bold text-gray-800">새로운 스포츠 동료 합류!</p>
              <p className="text-gray-500 mt-0.5">"[보라매공원] 저녁 러닝 함께해요!" 모임에 새로운 이웃이 참가 신청했습니다.</p>
              <span className="text-[10px] text-gray-400 block mt-1">5분 전</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-xs">
            <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full shrink-0 mt-1.5"></span>
            <div>
              <p className="font-bold text-gray-800">모임 준비안내</p>
              <p className="text-gray-500 mt-0.5">저녁 6시 보라매공원 러닝 모임 시간입니다. 수분 섭취와 몸풀기를 잊지 마세요!</p>
              <span className="text-[10px] text-gray-400 block mt-1">2시간 전</span>
            </div>
          </div>
        </div>

        <button
          @click="showNotificationPopup = false"
          className="w-full bg-[#006c49] hover:bg-[#005236] text-white font-bold py-2.5 rounded-xl text-xs mt-2 transition-all cursor-pointer"
        >
          알림 모두 읽음 처리
        </button>
      </div>
    </div>

    <!-- Floating Navigation Bar for Mobile screens -->
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2.5 px-6 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center">
      <button
        @click="() => {
          activeTab = 'explore';
          selectedPost = null;
        }"
        :className="`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'explore' ? 'text-[#006c49]' : 'text-gray-400'
        }`"
      >
        <Compass :size="22" :className="activeTab === 'explore' ? 'stroke-[2.5px]' : ''" />
        <span className="text-[10px] font-bold">Explore</span>
      </button>
      <button
        @click="() => {
          activeTab = 'matches';
          selectedPost = null;
        }"
        :className="`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'matches' ? 'text-[#006c49]' : 'text-gray-400'
        }`"
      >
        <Users :size="22" :className="activeTab === 'matches' ? 'stroke-[2.5px]' : ''" />
        <span className="text-[10px] font-bold">Matches</span>
      </button>
      <button
        @click="() => {
          activeTab = 'chat';
          activeChatId = null;
        }"
        :className="`flex flex-col items-center gap-1 cursor-pointer relative ${
          activeTab === 'chat' ? 'text-[#006c49]' : 'text-gray-400'
        }`"
      >
        <MessageSquare :size="22" :className="activeTab === 'chat' ? 'stroke-[2.5px]' : ''" />
        <span className="text-[10px] font-bold">Chat</span>
        <span v-if="totalUnread > 0" className="absolute top-0 right-1.5 bg-[#ba1a1a] text-white font-extrabold text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
          {{ totalUnread }}
        </span>
      </button>
    </div>

    <!-- Create Match Modal Popup -->
    <CreateMatchModal
      v-if="isCreateModalOpen"
      :initialLocationName="createModalInitialLocation"
      @close="closeCreateModal"
      @createPost="handleCreatePost"
    />

    <!-- AI Coach Drawer Sidebar -->
    <AICompanionDrawer
      v-if="isAIDrawerOpen"
      @close="isAIDrawerOpen = false"
      :postsContext="posts"
    />

  </div>
</template>
