<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from "vue";
import { X, Send, Bot, Sparkles, AlertCircle, ArrowRight } from "lucide-vue-next";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

const props = defineProps<{
  postsContext: any;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const messages = ref<Message[]>([
  {
    id: "init",
    sender: "ai",
    text: "안녕하세요! LocalHub의 AI 운동 동료이자 든든한 코치인 'AI Sport Mate'입니다. 🏃‍♂️💨\n\n동작구 근처 모임 장소 추천, 스포츠 경기 룰 설명, 혹은 눈길을 사로잡는 멋진 모집글 초안 작성을 도와드릴 수 있어요! 어떤 것이 궁금하신가요?"
  }
]);
const input = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const messagesEndRef = ref<HTMLDivElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: "smooth" });
  });
};

watch([messages, loading], () => {
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  scrollToBottom();
});

const handleSend = async (textToSend: string) => {
  if (!textToSend.trim() || loading.value) return;

  const userMsgId = Date.now().toString();
  const userMessage: Message = {
    id: userMsgId,
    sender: "user",
    text: textToSend
  };

  messages.value.push(userMessage);
  input.value = "";
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: textToSend
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to communicate with AI");
    }

    messages.value.push({
      id: (Date.now() + 1).toString(),
      sender: "ai",
      text: data.data.reply
    });
  } catch (err: any) {
    console.error(err);
    error.value = err.message || "AI 연결에 실패했습니다.";
  } finally {
    loading.value = false;
  }
};

const suggestions = [
  "🏃 러닝 모집글 초안 작성해줘",
  "🏸 배드민턴 복식 스코어 규칙 설명해줘",
  "🌳 보라매공원 근처 가벼운 조깅 루트 추천"
];
</script>

<template>
  <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl border-l border-gray-100 z-50 flex flex-col h-full animate-slide-in">
    
    <!-- Header -->
    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#006c49] to-[#10b981] text-white">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
          <Bot :size="20" />
        </div>
        <div>
          <h3 className="font-headline-md text-sm md:text-base font-bold flex items-center gap-1">
            AI Sport Mate
            <Sparkles :size="14" className="text-[#6ffbbe] animate-pulse" />
          </h3>
          <p className="text-[10px] text-emerald-100">동네 스포츠 AI 비서</p>
        </div>
      </div>
      <button
        @click="emit('close')"
        className="text-white hover:text-emerald-100 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
        aria-label="Close drawer"
      >
        <X :size="20" />
      </button>
    </div>

    <!-- Messages Content Stream -->
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :className="`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2.5`"
      >
        <div v-if="msg.sender === 'ai'" className="w-7 h-7 rounded-full bg-[#10b981]/15 text-[#006c49] border border-[#10b981]/10 flex items-center justify-center shrink-0 mt-0.5">
          <Bot :size="15" />
        </div>
        
        <div :className="`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`">
          <span v-if="msg.sender === 'ai'" className="text-[10px] text-gray-400 font-bold mb-1 ml-0.5">AI 비서</span>
          <div
            :className="`text-[13px] leading-relaxed p-3.5 rounded-2xl whitespace-pre-line shadow-3xs break-words ${
              msg.sender === 'user'
                ? 'bg-[#006c49] text-white rounded-tr-xs'
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-xs'
            }`"
          >
            {{ msg.text }}
          </div>
        </div>
      </div>

      <!-- Loading Bubble -->
      <div v-if="loading" className="flex justify-start items-start gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#10b981]/15 text-[#006c49] flex items-center justify-center shrink-0">
          <Bot :size="15" />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-xs p-3.5 shadow-3xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#006c49] rounded-full animate-bounce"></span>
          <span className="w-1.5 h-1.5 bg-[#006c49] rounded-full animate-bounce delay-100"></span>
          <span className="w-1.5 h-1.5 bg-[#006c49] rounded-full animate-bounce delay-200"></span>
        </div>
      </div>

      <!-- Error notification banner -->
      <div v-if="error" className="bg-[#ba1a1a]/5 border border-[#ba1a1a]/15 text-[#ba1a1a] rounded-xl p-3 text-xs flex items-center gap-2 max-w-sm mx-auto">
        <AlertCircle :size="14" className="shrink-0" />
        <p className="font-semibold">{{ error }}</p>
      </div>

      <div ref="messagesEndRef" />
    </div>

    <!-- Suggestion Prompt Chips -->
    <div v-if="messages.length === 1 && !loading" className="px-4 py-2 border-t border-gray-100/50 bg-white space-y-1.5">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">추천 프롬프트</p>
      <div className="flex flex-col gap-1.5">
        <button
          v-for="sug in suggestions"
          :key="sug"
          @click="handleSend(sug)"
          className="text-left text-xs text-gray-700 font-semibold bg-gray-50 hover:bg-[#006c49]/5 border border-gray-100 rounded-xl px-3.5 py-2.5 transition-all flex items-center justify-between group cursor-pointer"
        >
          <span>{{ sug }}</span>
          <ArrowRight :size="12" className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>

    <!-- Bottom Input Area -->
    <form
      @submit.prevent="handleSend(input)"
      className="p-4 border-t border-gray-100 bg-white flex gap-2"
    >
      <input
        type="text"
        placeholder="메이트에게 편하게 물어보세요..."
        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#006c49] text-gray-800"
        v-model="input"
        :disabled="loading"
      />
      <button
        type="submit"
        :disabled="!input.trim() || loading"
        className="bg-[#006c49] disabled:bg-gray-100 text-white disabled:text-gray-400 px-3.5 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer"
      >
        <Send :size="14" />
      </button>
    </form>

  </div>
</template>

<style scoped>
@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
