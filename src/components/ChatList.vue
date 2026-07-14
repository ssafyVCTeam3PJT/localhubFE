<script setup lang="ts">
import { MessageSquare, Users, Calendar } from "lucide-vue-next";
import type { ChatConversation } from "../types";

defineProps<{
  conversations: ChatConversation[];
  activeChatId: string | null;
}>();

const emit = defineEmits<{
  (e: "selectChat", chatId: string): void;
}>();

const getAvatarBg = (title: string) => {
  if (title.includes("Running") || title.includes("러닝")) {
    return "bg-emerald-100 text-emerald-600";
  } else if (title.includes("Basketball") || title.includes("농구")) {
    return "bg-blue-100 text-blue-600";
  } else if (title.includes("Badminton") || title.includes("배드민턴")) {
    return "bg-purple-100 text-purple-600";
  }
  return "bg-orange-100 text-orange-600";
};
</script>

<template>
  <div className="flex-1 bg-white h-full overflow-y-auto">
    
    <!-- Header section in chat tab -->
    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
      <div>
        <h2 className="font-headline-md text-lg font-bold text-gray-900 tracking-tight">익명 모임 채팅방</h2>
        <p className="text-xs text-gray-500 mt-0.5">참가 완료한 모임의 실시간 단톡방입니다.</p>
      </div>
      <span className="bg-[#006c49]/10 text-[#006c49] text-xs font-bold px-2.5 py-1 rounded-full">
        {{ conversations.length }}개 참여중
      </span>
    </div>

    <!-- Chat List Grid -->
    <div className="divide-y divide-gray-50">
      <div v-if="conversations.length === 0" className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          <MessageSquare :size="28" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">참여 중인 채팅방이 없습니다</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
          Explore 탭에서 마음에 드는 스포츠 모임에 참여하여 채팅을 시작해보세요!
        </p>
      </div>
      
      <template v-else>
        <button
          v-for="chat in conversations"
          :key="chat.id"
          @click="emit('selectChat', chat.id)"
          :className="`w-full text-left p-4 flex items-start gap-3 transition-all duration-150 cursor-pointer ${
            chat.id === activeChatId ? 'bg-[#006c49]/5 border-l-4 border-[#006c49] pl-3' : 'hover:bg-gray-50/70'
          }`"
        >
          <!-- Channel Icon Avatar -->
          <div :className="`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${getAvatarBg(chat.title)}`">
            {{ chat.title[1] || "G" }}
          </div>

          <!-- Info and Message -->
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="font-headline-sm text-[14px] md:text-sm font-bold text-gray-900 truncate pr-2">
                {{ chat.title }}
              </h4>
              <span className="text-[10px] text-gray-400 font-medium shrink-0">
                {{ chat.lastTime }}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1 truncate max-w-[95%]">
              {{ chat.lastMessage }}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <Users :size="10" /> {{ chat.joinedCount }}/{{ chat.maxCount }}
              </span>
              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                <Calendar :size="10" /> Live
              </span>
            </div>
          </div>

          <!-- Unread Badge indicator -->
          <div v-if="chat.unreadCount > 0" className="bg-[#ba1a1a] text-white text-[10px] font-bold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center shrink-0 self-center">
            {{ chat.unreadCount }}
          </div>
        </button>
      </template>
    </div>

  </div>
</template>
