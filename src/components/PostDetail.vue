<script setup lang="ts">
import { ref } from "vue";
import { ArrowLeft, Share2, MapPin, Eye, MessageSquare, Send, Users, CheckCircle2, Pencil, Trash2 } from "lucide-vue-next";
import type { Post } from "../types";
import { handleImageError } from "../image";

const props = defineProps<{
  post: Post;
  isJoined: boolean;
  isLoading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "join"): void;
  (e: "leave"): void;
  (e: "goToChat"): void;
  (e: "addComment", postId: string, content: string): void;
  (e: "requestEdit", post: Post): void;
  (e: "requestDelete", postId: string, password: string): void;
}>();

const commentText = ref("");
const shared = ref(false);
const passwordInput = ref("");
const showManageMenu = ref(false);

const handleCommentSubmit = (e: Event) => {
  e.preventDefault();
  if (!commentText.value.trim()) return;
  emit("addComment", props.post.id, commentText.value.trim());
  commentText.value = "";
};

const handleShare = () => {
  shared.value = true;
  navigator.clipboard.writeText(window.location.href);
  setTimeout(() => shared.value = false, 2000);
};

const handleDelete = () => {
  if (!passwordInput.value.trim()) {
    alert("비밀번호를 입력해주세요.");
    return;
  }
  emit("requestDelete", props.post.id, passwordInput.value.trim());
  passwordInput.value = "";
  showManageMenu.value = false;
};
</script>

<template>
  <div className="bg-white flex flex-col h-full overflow-y-auto pb-24 relative">
    <div v-if="isLoading" className="flex-1 flex items-center justify-center px-6 py-10 text-sm text-gray-500">
      상세 정보를 불러오는 중입니다...
    </div>
    <div v-else-if="error" className="flex-1 flex items-center justify-center px-6 py-10 text-sm text-amber-600">
      {{ error }}
    </div>
    <template v-else>
    <!-- Header Banner Image -->
    <div className="relative w-full h-[220px] md:h-[280px] bg-gray-200">
      <img
        :src="post.image || 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1000'"
        :alt="post.title"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        @error="handleImageError"
      />
      <!-- Soft overlay gradient -->
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>

      <!-- Back and Share Action floating buttons -->
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <button
          @click="emit('back')"
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200 cursor-pointer active:scale-95"
          aria-label="Back to map"
        >
          <ArrowLeft :size="20" />
        </button>
        <button
          @click="handleShare"
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200 cursor-pointer relative active:scale-95"
          aria-label="Share post"
        >
          <Share2 :size="20" />
          <span
            v-if="shared"
            className="absolute right-0 -bottom-8 bg-black/80 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-md"
          >
            Link Copied!
          </span>
        </button>
      </div>

      <!-- Dynamic sport label floating inside header -->
      <span className="absolute bottom-4 left-4 bg-[#10b981] text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
        {{ post.sport }}
      </span>
    </div>

    <!-- Main Metadata and Content Grid -->
    <div className="max-w-[720px] w-full mx-auto px-4 md:px-6 py-6 flex flex-col">
      <!-- Status & Post Date -->
      <div className="flex items-center justify-between gap-3">
        <span :className="`text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-sm ${
          post.status === '모집중' ? 'bg-[#10b981]/10 text-[#006c49]' : 'bg-gray-100 text-gray-500'
        }`">
          {{ post.status }}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{{ post.createdAt }}</span>
          <span className="flex items-center gap-0.5">
            <Eye :size="12" /> {{ post.views }}
          </span>
          <div className="relative">
            <button
              @click="showManageMenu = !showManageMenu"
              className="rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-gray-600 shadow-xs hover:text-[#006c49]"
            >
              관리
            </button>
            <div v-if="showManageMenu" className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-100 bg-white p-2 shadow-lg z-20">
              <button
                @click="emit('requestEdit', post)"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil :size="14" /> 수정하기
              </button>
              <div className="mt-2 border-t border-gray-100 pt-2">
                <input
                  v-model="passwordInput"
                  type="password"
                  placeholder="비밀번호"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                  @click="handleDelete"
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#ba1a1a] hover:bg-red-50"
                >
                  <Trash2 :size="14" /> 삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Post Title -->
      <h1 className="font-headline-lg text-xl md:text-2xl font-bold text-gray-900 mt-3 leading-snug tracking-tight">
        {{ post.title }}
      </h1>

      <!-- Anonymous author note -->
      <div className="flex items-center gap-3 mt-4 border-b border-gray-100 pb-4">
        <div className="w-10 h-10 rounded-full bg-[#006c49]/10 text-[#006c49] font-bold text-sm flex items-center justify-center">
          익
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">익명 작성자</p>
          <p className="text-[11px] text-gray-400 font-medium">로그인 없이 익명으로 운영되는 커뮤니티입니다.</p>
        </div>
      </div>

      <!-- Location Section -->
      <div className="bg-[#f3f4f6]/60 rounded-2xl p-4 mt-5 flex items-start gap-3 border border-gray-100">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#006c49] shadow-xs shrink-0 mt-0.5">
          <MapPin :size="18" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">주소 및 모임위치</h4>
          <p className="text-sm font-bold text-gray-800 mt-0.5">{{ post.location }}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ post.address }}</p>
        </div>
      </div>

      <!-- Description/Body -->
      <div className="mt-6">
        <p className="font-body-md text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
          {{ post.description }}
        </p>
      </div>

      <!-- Tag list -->
      <div className="flex flex-wrap gap-2 mt-6">
        <span v-for="t in post.tags" :key="t" className="text-[#006c49] text-xs font-semibold bg-[#10b981]/10 px-3 py-1 rounded-full">
          #{{ t }}
        </span>
      </div>

      <!-- Join Progress Bar Card -->
      <div className="bg-white border border-gray-100 shadow-xs rounded-2xl p-4 mt-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Users :size="16" className="text-[#006c49]" />
            참가 신청 인원
          </span>
          <span className="text-sm font-extrabold text-[#006c49]">
            {{ post.joinedCount }} / {{ post.maxCount }} 명
          </span>
        </div>

        <!-- Progress bar container -->
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-[#10b981] h-full transition-all duration-500 rounded-full"
            :style="{
              width: `${(post.joinedCount / post.maxCount) * 100}%`
            }"
          ></div>
        </div>
        
        <p className="text-[11px] text-gray-400 mt-2">
          * 선착순 모집이며, 모집인원이 차면 자동으로 모집 마감됩니다.
        </p>
      </div>

      <!-- Comments Section -->
      <div className="mt-10 border-t border-gray-100 pt-8">
        <h3 className="font-headline-md text-base text-gray-900 font-bold mb-4 flex items-center gap-1.5">
          <MessageSquare :size="18" className="text-gray-400" />
          댓글 {{ post.comments.length }}
        </h3>

        <!-- Comments List -->
        <div className="space-y-4">
          <p v-if="post.comments.length === 0" className="text-sm text-gray-400 text-center py-6">
            첫 댓글을 작성해보세요!
          </p>
          <template v-else>
            <div v-for="comment in post.comments" :key="comment.id" className="flex gap-3 text-sm bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                {{ comment.author[0] }}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">{{ comment.author }}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{{ comment.createdAt }}</span>
                </div>
                <p className="text-gray-600 mt-1 leading-relaxed text-[13px]">{{ comment.content }}</p>
              </div>
            </div>
          </template>
        </div>

        <!-- Comment Write Input form -->
        <form @submit="handleCommentSubmit" className="mt-5 flex gap-2">
          <input
            type="text"
            placeholder="댓글을 남겨주세요..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006c49] transition-all"
            v-model="commentText"
          />
          <button
            type="submit"
            className="bg-[#006c49] hover:bg-[#005236] text-white p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <Send :size="16" />
          </button>
        </form>
      </div>
    </div>

    <!-- Persistent Bottom Action Bar (sticky) -->
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30">
      <div className="max-w-[720px] mx-auto flex gap-3">
        <button
          v-if="isJoined"
          @click="emit('goToChat')"
          className="flex-[2] bg-[#006c49] hover:bg-[#005236] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer text-sm"
        >
          <MessageSquare :size="18" />
          채팅방 가기
        </button>
        <button
          v-if="isJoined"
          @click="emit('leave')"
          className="flex-[1] bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer text-sm"
        >
          참가 취소
        </button>
        <button
          v-else
          @click="emit('join')"
          className="flex-1 bg-[#10b981] hover:bg-[#0d9488] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer text-sm"
        >
          <CheckCircle2 :size="18" />
          이 모임 참가하기
        </button>
      </div>
    </div>
    </template>

  </div>
</template>
