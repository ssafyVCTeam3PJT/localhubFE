<script setup lang="ts">
import { Bell } from "lucide-vue-next";

defineProps<{
  activeTab: "explore" | "matches" | "chat";
  unreadCount: number;
}>();

const emit = defineEmits<{
  (e: "tabChange", tab: "explore" | "matches" | "chat"): void;
  (e: "notificationsClick"): void;
}>();
</script>

<template>
  <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
    <div className="flex justify-between items-center w-full px-4 md:px-8 py-3.5 max-w-[1200px] mx-auto">
      <!-- Brand -->
      <div className="flex items-center gap-2 cursor-pointer" @click="emit('tabChange', 'explore')">
        <span className="font-headline-md text-xl md:text-2xl font-bold text-[#006c49] tracking-tight">
          LocalHub
        </span>
        <div className="bg-[#10b981]/10 text-[#006c49] text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
          Local
        </div>
      </div>

      <!-- Navigation Links -->
      <nav className="hidden md:flex space-x-2 lg:space-x-4">
        <button
          @click="emit('tabChange', 'explore')"
          :className="`font-medium px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'explore'
              ? 'text-[#006c49] bg-[#006c49]/5 font-semibold'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`"
        >
          Explore
        </button>
        <button
          @click="emit('tabChange', 'matches')"
          :className="`font-medium px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'matches'
              ? 'text-[#006c49] bg-[#006c49]/5 font-semibold'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`"
        >
          Matches
        </button>
        <button
          @click="emit('tabChange', 'chat')"
          :className="`font-medium px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer relative ${
            activeTab === 'chat'
              ? 'text-[#006c49] bg-[#006c49]/5 font-semibold'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`"
        >
          Chat
          <span
            v-if="unreadCount > 0"
            className="absolute top-1.5 right-1.5 bg-[#ba1a1a] text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white"
          >
            {{ unreadCount }}
          </span>
        </button>
      </nav>

      <!-- Trailing Icons -->
      <div className="flex items-center space-x-1 md:space-x-3">
        <button
          @click="emit('notificationsClick')"
          className="text-gray-500 hover:text-[#006c49] p-2 hover:bg-gray-50 rounded-full transition-all duration-200 cursor-pointer relative"
          aria-label="Notifications"
        >
          <Bell :size="20" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
        </button>
      </div>
    </div>
  </header>
</template>
