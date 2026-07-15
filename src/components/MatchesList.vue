<script setup lang="ts">
import { ref, computed } from "vue";
import { Search, MapPin, Users, Plus, Check, ChevronRight } from "lucide-vue-next";
import type { Post } from "../types";

const props = defineProps<{
  posts: Post[];
  joinedPostIds: string[];
}>();

const emit = defineEmits<{
  (e: "selectPost", post: Post): void;
  (e: "openCreateModal"): void;
}>();

const activeFilter = ref("전체");
const searchQuery = ref("");
const tabMode = ref<"all" | "my">("all");

const sportsFilters = ["전체", "러닝", "농구", "축구", "배드민턴", "기타"];

const myJoinedPostCount = computed(() => {
  return props.posts.filter((post) => props.joinedPostIds.includes(post.id)).length;
});

const soccerMatesCount = computed(() => {
  return props.posts
    .filter(p => p.sport === "축구")
    .reduce((sum, p) => sum + p.joinedCount, 0);
});

const runningOpenCount = computed(() => {
  return props.posts.filter(p => p.sport === "러닝" && p.status === "모집중").length;
});


// Filter posts based on tabMode, search, and sport filter
const filteredPosts = computed(() => {
  return props.posts.filter((post) => {
    // 1. Tab Mode filter
    if (tabMode.value === "my" && !props.joinedPostIds.includes(post.id)) {
      return false;
    }
    // 2. Sport filter
    if (activeFilter.value !== "전체" && post.sport !== activeFilter.value) {
      return false;
    }
    // 3. Search query filter
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.location.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });
});
</script>

<template>
  <div className="flex-1 bg-gray-50/50 h-full overflow-y-auto pb-10">
    
    <!-- Search Header Banner -->
    <div className="bg-gradient-to-br from-[#006c49] to-[#10b981] text-white px-6 py-8 md:py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
      <div className="max-w-[720px] mx-auto relative z-10">
        <h2 className="font-headline-lg text-2xl md:text-3xl font-extrabold tracking-tight">
          동네 스포츠 메이트 찾기
        </h2>
        <p className="text-white/80 text-xs md:text-sm mt-1 font-medium">
          이웃집 이웃들과 같이 운동해요. 러닝, 축구, 배드민턴 동료를 만나보세요.
        </p>

        <!-- Quick Stats -->
        <div className="flex gap-4 mt-4 md:mt-6 text-xs text-emerald-100/90 font-semibold">
          <span>⚽ 축구 메이트 {{ soccerMatesCount }}명 활동중</span>
          <span>🏃 러닝 모임 {{ runningOpenCount }}개 오픈</span>
        </div>
      </div>
    </div>

    <!-- Dashboard Tabs & Controls -->
    <div className="max-w-[720px] mx-auto px-4 mt-6 flex flex-col gap-3">
      
      <!-- Toggle Mode Tab Buttons -->
      <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50">
        <button
          @click="tabMode = 'all'"
          :className="`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tabMode === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`"
        >
          전체 모집글 ({{ posts.length }})
        </button>
        <button
          @click="tabMode = 'my'"
          :className="`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tabMode === 'my' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`"
        >
          내가 가입한 모임 ({{ myJoinedPostCount }})
        </button>
      </div>

      <!-- Search Input inline -->
      <div className="relative">
        <input
          type="text"
          placeholder="제목, 공원 이름, 해시태그로 검색..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#006c49] shadow-2xs text-gray-800"
          v-model="searchQuery"
        />
        <Search :size="16" className="text-gray-400 absolute left-3.5 top-3.5" />
      </div>

      <!-- Sports Category Filter Pill Scroller -->
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth">
        <button
          v-for="sport in sportsFilters"
          :key="sport"
          @click="activeFilter = sport"
          :className="`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
            activeFilter === sport
              ? 'bg-[#006c49] text-white border-[#006c49]'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`"
        >
          {{ sport }}
        </button>
      </div>

      <!-- List of Match Cards -->
      <div className="space-y-4 mt-1">
        <div v-if="filteredPosts.length === 0" className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <p className="text-sm text-gray-500">
            {{ tabMode === 'my' 
              ? '참여 신청한 모임이 없습니다. 지도나 목록에서 모임을 찾아보세요!' 
              : '검색 및 필터 조건에 부합하는 모집글이 없습니다.' }}
          </p>
          <button
            v-if="tabMode === 'all'"
            @click="emit('openCreateModal')"
            className="mt-4 bg-[#10b981] hover:bg-[#006c49] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus :size="14" /> 직접 모임 만들기
          </button>
        </div>
        
        <template v-else>
          <div
            v-for="post in filteredPosts"
            :key="post.id"
            @click="emit('selectPost', post)"
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex gap-4 relative overflow-hidden group"
          >
            <!-- Thumbnail Image left -->
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
              <img
                :src="post.image || 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=200'"
                :alt="post.title"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>

            <!-- Body Info -->
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <!-- Top Header Row -->
                <div className="flex justify-between items-center mb-1">
                  <span :className="`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                    post.status === '모집중' ? 'bg-[#10b981]/10 text-[#006c49]' : 'bg-gray-100 text-gray-500'
                  }`">
                    {{ post.status }}
                  </span>
                  
                  <!-- Joined badge marker -->
                  <span v-if="joinedPostIds.includes(post.id)" className="bg-[#006c49] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-0.5 shadow-2xs">
                    <Check :size="8" /> 가입됨
                  </span>
                </div>

                <!-- Post Title -->
                <h3 className="font-headline-sm text-sm md:text-base font-bold text-gray-900 group-hover:text-[#006c49] transition-colors leading-snug line-clamp-1">
                  {{ post.title }}
                </h3>

                <!-- Map Location -->
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-0.5 truncate">
                  <MapPin :size="12" className="text-gray-400 shrink-0" />
                  {{ post.location }}
                </p>
              </div>

              <!-- Bottom Capacity / Tag Info -->
              <div className="flex justify-between items-center border-t border-gray-50 pt-2 mt-2">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold">
                  <span className="flex items-center gap-0.5 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm">
                    <Users :size="10" /> {{ post.joinedCount }} / {{ post.maxCount }}명
                  </span>
                  <span>조회 {{ post.views }}</span>
                </div>
                
                <span className="text-[10px] font-bold text-[#006c49] flex items-center gap-0.5">
                  자세히 보기
                  <ChevronRight :size="12" className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>

    </div>

  </div>
</template>
