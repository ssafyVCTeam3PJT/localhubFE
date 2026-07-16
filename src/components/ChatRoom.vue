<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { ArrowLeft, Send, Users, Shield, Plus, Image, LogOut } from "lucide-vue-next";
import type { ChatConversation } from "../types";
import { getOrCreateProfile } from "../userProfile";

const props = defineProps<{
  chat: ChatConversation;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "requestLeave", chatId: string): void;
}>();

const profile = ref(getOrCreateProfile());
const inputText = ref("");
const messagesEndRef = ref<HTMLDivElement | null>(null);
const localMessages = ref<any[]>([]);
let ws: WebSocket | null = null;

const scrollToBottom = () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: "smooth" });
  });
};

watch(localMessages, () => {
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/ws/chat/${props.chat.id}?userId=${profile.value.userId}&nickname=${encodeURIComponent(profile.value.nickname)}`;
  
  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'history') {
      localMessages.value = data.messages;
    } else {
      localMessages.value.push(data);
    }
  };

  scrollToBottom();
});

onUnmounted(() => {
  if (ws) {
    ws.close();
  }
});

const handleSend = (e: Event) => {
  e.preventDefault();
  if (!inputText.value.trim() || !ws) return;
  
  ws.send(JSON.stringify({ content: inputText.value.trim() }));
  inputText.value = "";
};

const getInitial = (sender: string) => {
  return sender.includes("Author") || sender.includes("작성자") ? "작" : sender[sender.length - 1] || "익";
};

const isHostSender = (sender: string) => {
  return sender.includes("Author") || sender.includes("작성자");
};

const formatTime = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
    
    <!-- Active Room Header -->
    <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between shadow-xs sticky top-0 z-10">
      <div className="flex items-center gap-2 min-w-0">
        <button
          @click="emit('back')"
          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full transition-colors cursor-pointer mr-0.5"
          aria-label="Back to conversations"
        >
          <ArrowLeft :size="20" />
        </button>
        
        <div className="min-w-0">
          <h3 className="font-headline-sm text-sm md:text-base font-bold text-gray-900 truncate">
            {{ chat.title }}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-0.5">
              <Users :size="11" className="inline" /> 익명 단톡방 ({{ profile.nickname }} 접속 중)
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-emerald-50 text-[#006c49] text-[10px] font-extrabold px-2 py-1 rounded-md border border-emerald-100 uppercase tracking-widest hidden sm:inline-block">
          Active Room
        </div>
        <button
          @click="emit('requestLeave', chat.id)"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-bold text-gray-500 hover:bg-pink-50 hover:text-[#be185d] transition-colors cursor-pointer"
          aria-label="Leave chat room"
        >
          <LogOut :size="14" />
          나가기
        </button>
      </div>
    </div>

    <!-- Message scroll container -->
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <!-- Safe anonymous chat tip banner -->
      <div className="bg-[#006c49]/5 border border-[#006c49]/10 rounded-2xl p-3.5 flex items-start gap-2.5 max-w-md mx-auto text-center justify-center">
        <Shield :size="16" className="text-[#006c49] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#005236] leading-relaxed font-medium">
          비매너 발언이나 욕설 시 서비스 이용이 제한될 수 있습니다.<br/>
          서로 배려하고 존중하는 건강한 LocalHub를 함께 만들어요!
        </p>
      </div>

      <!-- Message bubble stream -->
      <template v-for="(msg, idx) in localMessages" :key="idx">
        
        <!-- System Message -->
        <div v-if="msg.type === 'system'" className="flex justify-center my-2">
          <div className="bg-gray-200 text-gray-600 text-[11px] px-3 py-1 rounded-full">
            {{ msg.content }}
          </div>
        </div>

        <!-- Message sent by me -->
        <div v-else-if="msg.userId === profile.userId" className="flex justify-end items-end gap-1.5">
          <span className="text-[9px] text-gray-400 font-medium mb-1 shrink-0">{{ formatTime(msg.createdAt) }}</span>
          <div className="bg-[#006c49] text-white text-[13px] leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-tr-xs max-w-[70%] shadow-xs break-words">
            {{ msg.content }}
          </div>
        </div>

        <!-- Message sent by others -->
        <div v-else className="flex gap-2.5 items-start">
          <div :className="`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs mt-1 ${
            isHostSender(msg.nickname || '') ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-50 text-[#006c49]'
          }`">
            {{ getInitial(msg.nickname || '익명') }}
          </div>
          <div className="flex flex-col gap-1 max-w-[70%]">
            <span className="text-[11px] font-bold text-gray-500 px-0.5 flex items-center gap-1">
              {{ msg.nickname || '익명' }}
              <span v-if="isHostSender(msg.nickname || '')" className="text-[8px] bg-amber-500 text-white font-extrabold px-1 py-0.2 rounded-sm uppercase scale-90">Host</span>
            </span>
            
            <div className="flex items-end gap-1.5">
              <div className="bg-white border border-gray-100 text-gray-800 text-[13px] leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-3xs break-words">
                {{ msg.content }}
              </div>
              <span className="text-[9px] text-gray-400 font-medium mb-1 shrink-0">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Dummy div to scroll into -->
      <div ref="messagesEndRef" />
    </div>

    <!-- Bottom Input controls -->
    <form @submit="handleSend" className="bg-white border-t border-gray-100 px-4 py-3.5 flex items-center gap-2">
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-full transition-colors cursor-pointer shrink-0"
        aria-label="Add image"
      >
        <Image :size="20" />
      </button>
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-full transition-colors cursor-pointer shrink-0 mr-1"
        aria-label="Add options"
      >
        <Plus :size="20" />
      </button>

      <input
        type="text"
        placeholder="메시지를 입력하세요..."
        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#006c49] focus:bg-white transition-all text-gray-800"
        v-model="inputText"
      />

      <button
        type="submit"
        :disabled="!inputText.trim()"
        className="bg-[#006c49] disabled:bg-gray-200 text-white disabled:text-gray-400 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
      >
        <Send :size="16" />
      </button>
    </form>

  </div>
</template>
