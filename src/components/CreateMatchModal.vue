<script setup lang="ts">
import { ref, watch } from "vue";
import { X, Check, Sparkles } from "lucide-vue-next";
import type { Post } from "../types";
import { handleImageError } from "../image";

type CreatePostPayload = Partial<Post> & { editPassword?: string };

const props = defineProps<{
  initialLocationName?: string | null;
  initialValues?: Partial<Post> | null;
  isEditMode?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "createPost", newPost: CreatePostPayload): void;
}>();

const title = ref("");
const locationName = ref("보라매공원");
const sport = ref<"러닝" | "농구" | "축구" | "배드민턴" | "기타">("러닝");
const capacity = ref(4);
const description = ref("");
const tagsInput = ref("");
const editPassword = ref("");
const selectedImage = ref("https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600");

const locationPresets = [
  { name: "보라매공원", address: "서울특별시 동작구 여의대방로20길 33", lat: 35, lng: 38 },
  { name: "반포한강공원 농구장", address: "서울특별시 서초구 신반포로11길 144-1", lat: 55, lng: 65 },
  { name: "관악산 서울대입구 입구", address: "서울특별시 관악구 관악로 1", lat: 45, lng: 20 },
  { name: "동작구민체육센터", address: "서울특별시 동작구 여의대방로16길 53", lat: 68, lng: 32 }
];

const presetImages = [
  { label: "🏃 러닝/달리기", url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600" },
  { label: "🏀 농구/길거리", url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600" },
  { label: "🏸 배드민턴/실내", url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600" },
  { label: "🧗 등산/액티비티", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600" }
];

const applyInitialLocation = (value?: string | null) => {
  if (value && value.trim()) {
    locationName.value = value.trim();
    return;
  }

  locationName.value = locationPresets[0].name;
};

watch(() => props.initialLocationName, (value) => {
  applyInitialLocation(value);
}, { immediate: true });

watch(() => props.initialValues, (value) => {
  if (!value) return;
  title.value = value.title ?? "";
  locationName.value = value.location ?? locationPresets[0].name;
  sport.value = (value.sport as typeof sport.value) ?? "러닝";
  capacity.value = value.maxCount ?? 4;
  description.value = value.description ?? "";
  tagsInput.value = (value.tags ?? []).join(", ");
  selectedImage.value = value.image ?? selectedImage.value;
}, { immediate: true });

const handleSubmit = (e: Event) => {
  e.preventDefault();
  if (!title.value.trim() || !description.value.trim()) {
    alert("모든 필수 항목을 입력해주세요.");
    return;
  }

  const matchedPreset = locationPresets.find((loc) => loc.name === locationName.value) || {
    name: locationName.value || locationPresets[0].name,
    address: "선택된 지역",
    lat: 37.5665,
    lng: 126.9780
  };

  // Split tags
  const tags = tagsInput.value
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length > 0);

  // If tag is empty, set default sport name tag
  if (tags.length === 0) {
    tags.push(sport.value);
  }

  emit("createPost", {
    title: title.value.trim(),
    location: matchedPreset.name,
    address: matchedPreset.address,
    sport: sport.value,
    description: description.value.trim(),
    tags,
    maxCount: Number(capacity.value),
    joinedCount: 1, // Author joins automatically
    lat: matchedPreset.lat + (Math.random() * 4 - 2), // small offset to prevent exact overlap
    lng: matchedPreset.lng + (Math.random() * 4 - 2),
    image: selectedImage.value,
    editPassword: editPassword.value.trim()
  });
};
</script>

<template>
  <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col my-8">
      
      <!-- Modal Header -->
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-headline-md text-base md:text-lg font-bold text-gray-900 flex items-center gap-1.5">
            <Sparkles :size="18" className="text-[#10b981]" />
            {{ isEditMode ? '모임 수정하기' : '스포츠 모임 개설하기' }}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{{ isEditMode ? '모임 정보를 수정하고 다시 공유해보세요.' : '새로운 모임을 개설하고 운동 파트너를 구해보세요.' }}</p>
        </div>
        <button
          @click="emit('close')"
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Modal Form scroll container -->
      <form @submit="handleSubmit" className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        
        <!-- Title Input -->
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            모집 글 제목 <span className="text-[#ba1a1a]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="예) [보라매공원] 저녁 러닝 함께해요!"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006c49] text-gray-800"
            v-model="title"
          />
        </div>

        <!-- Fixed location from the selected region -->
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            모임 장소
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700">
            {{ locationName }}
          </div>
          <p className="text-[11px] text-gray-400">
            지역 상세 페이지에서 선택한 장소로 자동 등록됩니다.
          </p>
        </div>

        <!-- Grid for Sport Type and Capacity -->
        <div className="grid grid-cols-2 gap-4">
          <!-- Sport Select -->
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              운동 종목 <span className="text-[#ba1a1a]">*</span>
            </label>
            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006c49] text-gray-800"
              v-model="sport"
            >
              <option value="러닝">러닝</option>
              <option value="농구">농구</option>
              <option value="축구">축구</option>
              <option value="배드민턴">배드민턴</option>
              <option value="기타">기타/등산</option>
            </select>
          </div>

          <!-- Capacity slider input -->
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              모집 정원: <span className="text-[#006c49] font-extrabold">{{ capacity }}명</span>
            </label>
            <input
              type="range"
              min="2"
              max="20"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#10b981] mt-3"
              v-model="capacity"
            />
          </div>
        </div>

        <!-- Background image preview cards selector -->
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            대표 사진 선택
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              v-for="img in presetImages"
              :key="img.label"
              type="button"
              @click="selectedImage = img.url"
              :className="`relative rounded-xl overflow-hidden h-14 border-2 text-left cursor-pointer transition-all ${
                selectedImage === img.url ? 'border-[#006c49] ring-2 ring-[#006c49]/10' : 'border-transparent opacity-80 hover:opacity-100'
              }`"
            >
              <img :src="img.url" className="w-full h-full object-cover" referrerPolicy="no-referrer" @error="handleImageError" />
              <div className="absolute inset-0 bg-black/40 flex items-center px-3 justify-between">
                <span className="text-white text-[11px] font-bold">{{ img.label }}</span>
                <div v-if="selectedImage === img.url" className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center text-white">
                  <Check :size="10" />
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Description Textarea -->
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            상세 설명 <span className="text-[#ba1a1a]">*</span>
          </label>
          <textarea
            required
            rows="3"
            placeholder="일시, 준비물, 운동 진행 방식 등을 자세히 공유해 주세요. (예: 초보자도 즐겁게 뛸 수 있는 템포입니다!)"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006c49] text-gray-800 placeholder-gray-400"
            v-model="description"
          />
        </div>

        <!-- Tags string list input -->
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            태그 설정 <span className="text-gray-400 font-medium">(쉼표로 구분)</span>
          </label>
          <input
            type="text"
            placeholder="예) 초보환영, 주말모임, 야간스포츠"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006c49] text-gray-800 placeholder-gray-400"
            v-model="tagsInput"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            수정/삭제 비밀번호 <span className="text-[#ba1a1a]">*</span>
          </label>
          <input
            type="password"
            required
            placeholder="예) 1234"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006c49] text-gray-800 placeholder-gray-400"
            v-model="editPassword"
          />
          <p className="text-[11px] text-gray-400">
            나중에 이 비밀번호로 모임을 수정하거나 삭제할 수 있습니다.
          </p>
        </div>

      </form>

      <!-- Modal Footer Controls -->
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
        <button
          type="button"
          @click="emit('close')"
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
        >
          취소
        </button>
        <button
          type="button"
          @click="handleSubmit"
          className="px-5 py-2.5 bg-[#006c49] hover:bg-[#005236] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          {{ isEditMode ? '수정 완료' : '개설 완료' }}
        </button>
      </div>

    </div>
  </div>
</template>
