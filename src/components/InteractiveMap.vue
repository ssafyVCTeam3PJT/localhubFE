<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { MapPin, Plus, Minus, Bot, Star, ChevronLeft, ChevronRight, Search, CloudSun } from "lucide-vue-next";
import type { Post } from "../types";
import { fetchPlaces } from "../api";

declare global {
  interface Window {
    naver?: any;
    __localhubNaverMapScriptLoaded?: boolean;
  }
}

interface LocationMeta {
  address: string;
  rating: number;
  totalCount: number;
  lat: number;
  lng: number;
  weatherCity: string;
}

interface WeatherData {
  description: string;
  temp: number;
  icon: string;
  main: string;
  cityName: string;
  locationLabel: string;
}

const props = defineProps<{
  posts: Post[];
}>();

const emit = defineEmits<{
  (e: "selectPost", post: Post): void;
  (e: "openCreateModal"): void;
  (e: "openAIDrawer"): void;
}>();

const zoom = ref(11);
const searchQuery = ref("");
const selectedLocation = ref<string | null>(null);
const carouselIndex = ref(0);
const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<any>(null);
const mapMarkers = ref<any[]>([]);
const isMapReady = ref(false);
const mapError = ref<string | null>(null);
const mapLoading = ref(false);
const weather = ref<WeatherData | null>(null);
const weatherLoading = ref(false);
const weatherError = ref<string | null>(null);

const backendPlaces = ref<Array<{ id: string; name: string; address: string; lat: number; lng: number; postCount: number }>>([]);

const locationMeta: Record<string, LocationMeta> = {
  "보라매공원": {
    address: "서울특별시 동작구 여의대방로20길 33",
    rating: 4.8,
    totalCount: 12,
    lat: 37.4928,
    lng: 126.9243,
    weatherCity: "Seoul"
  },
  "반포한강공원 농구장": {
    address: "서울특별시 서초구 신반포로11길 144-1",
    rating: 4.5,
    totalCount: 5,
    lat: 37.5092,
    lng: 126.9958,
    weatherCity: "Seoul"
  },
  "관악산 서울대입구 입구": {
    address: "서울특별시 관악구 관악로 1",
    rating: 4.6,
    totalCount: 3,
    lat: 37.4772,
    lng: 126.9514,
    weatherCity: "Seoul"
  },
  "동작구민체육센터": {
    address: "서울특별시 동작구 여의대방로16길 53",
    rating: 4.4,
    totalCount: 2,
    lat: 37.5038,
    lng: 126.9536,
    weatherCity: "Seoul"
  }
};

const locationGroups = computed(() => {
  const entries = Object.entries(locationMeta);
  const backendEntries = backendPlaces.value.map((place) => [place.name, {
    address: place.address,
    rating: 4.5,
    totalCount: place.postCount,
    lat: place.lat,
    lng: place.lng,
    weatherCity: "Seoul"
  }] as const);

  const merged = [...entries, ...backendEntries];

  return merged.reduce<Record<string, LocationMeta & { posts: Post[] }>>((acc, [locationName, meta]) => {
    acc[locationName] = {
      ...meta,
      posts: props.posts.filter((post) => {
        const haystack = `${post.location} ${post.title}`.toLowerCase();
        return haystack.includes(locationName.toLowerCase()) || (haystack.includes("보라매") && locationName === "보라매공원");
      })
    };
    return acc;
  }, {});
});

const staticMapUrl = computed(() => {
  const clientId = import.meta.env.VITE_NAVER_STATIC_MAP_CLIENT_ID;
  const selectedMeta = locationMeta[selectedLocation.value || "보라매공원"];

  if (!clientId || !selectedMeta) return null;

  const center = `${selectedMeta.lng},${selectedMeta.lat}`;
  const marker = `type:t|size:mid|pos:${selectedMeta.lng} ${selectedMeta.lat}`;
  return `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=800&h=600&center=${center}&level=14&markers=${encodeURIComponent(marker)}`;
});

const handleMarkerClick = (locationName: string) => {
  selectedLocation.value = locationName;
  carouselIndex.value = 0;
};

const handlePrevCarousel = (e: MouseEvent, groupPosts: Post[]) => {
  e.stopPropagation();
  carouselIndex.value = carouselIndex.value === 0 ? groupPosts.length - 1 : carouselIndex.value - 1;
};

const handleNextCarousel = (e: MouseEvent, groupPosts: Post[]) => {
  e.stopPropagation();
  carouselIndex.value = carouselIndex.value === groupPosts.length - 1 ? 0 : carouselIndex.value + 1;
};

const clearMarkers = () => {
  mapMarkers.value.forEach((marker) => marker.setMap(null));
  mapMarkers.value = [];
};

const renderMap = () => {
  if (!mapContainer.value || !window.naver?.maps) return;

  if (mapInstance.value) {
    mapInstance.value.setCenter(new window.naver.maps.LatLng(37.5665, 126.9780));
    mapInstance.value.setZoom(zoom.value);
  } else {
    mapInstance.value = new window.naver.maps.Map(mapContainer.value, {
      center: new window.naver.maps.LatLng(37.5665, 126.9780),
      zoom: zoom.value,
      minZoom: 10,
      maxZoom: 18,
      disableDoubleTapZoom: false,
      mapDataControl: false,
      scaleControl: false,
      logoControl: false,
    });
  }

  clearMarkers();

  const markerPlaces = Object.entries(locationGroups.value);
  markerPlaces.forEach(([locationName, meta]) => {
    const marker = new window.naver.maps.Marker({
      map: mapInstance.value,
      position: new window.naver.maps.LatLng(meta.lat, meta.lng),
      title: locationName,
      icon: {
        content: `<div style="background:#006c49;color:#fff;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.2);">${locationName}</div>`,
        anchor: new window.naver.maps.Point(10, 10)
      }
    });

    window.naver.maps.Event.addListener(marker, "click", () => {
      handleMarkerClick(locationName);
    });

    mapMarkers.value.push(marker);
  });

  isMapReady.value = true;
};

const initializeMap = async () => {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

  if (!clientId) {
    mapError.value = "네이버 지도 API 키가 설정되지 않았습니다. .env.local에 VITE_NAVER_MAP_CLIENT_ID를 추가해 주세요.";
    isMapReady.value = false;
    return;
  }

  if (window.naver?.maps) {
    renderMap();
    return;
  }

  if (window.__localhubNaverMapScriptLoaded) {
    renderMap();
    return;
  }

  const script = document.createElement("script");
  script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
  script.async = true;
  script.onload = () => {
    window.__localhubNaverMapScriptLoaded = true;
    renderMap();
  };
  script.onerror = () => {
    mapError.value = "네이버 지도 스크립트를 불러오지 못했습니다. API 키를 확인해 주세요.";
  };

  document.head.appendChild(script);
};

const getWeatherLocationLabel = (address: string, fallback: string) => {
  const parts = address.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return fallback;
};

const normalizeWeatherCityName = (value: string | undefined, fallback: string) => {
  const normalized = value?.toLowerCase();
  const cityMap: Record<string, string> = {
    seoul: "서울",
    busan: "부산",
    daegu: "대구",
    incheon: "인천",
    gwangju: "광주",
    daejeon: "대전",
    ulsan: "울산",
    sejong: "세종",
    suwon: "수원",
    jeju: "제주"
  };

  if (!normalized) return fallback;
  return cityMap[normalized] || value || fallback;
};

const fetchWeather = async (locationName: string) => {
  weatherLoading.value = true;
  weatherError.value = null;
  weather.value = null;

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) {
    weatherLoading.value = false;
    weatherError.value = "OpenWeather API 키가 설정되지 않았습니다. .env.local에 VITE_OPENWEATHER_API_KEY를 추가해 주세요.";
    return;
  }

  const meta = locationMeta[locationName];
  if (!meta) {
    weatherLoading.value = false;
    return;
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${meta.lat}&lon=${meta.lng}&appid=${apiKey}&lang=kr&units=metric`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "날씨를 불러오지 못했습니다.");
    }

    const cityName = normalizeWeatherCityName(data.name, meta.weatherCity);
    const locationLabel = getWeatherLocationLabel(meta.address, cityName);

    weather.value = {
      description: data.weather?.[0]?.description ?? "맑음",
      temp: data.main?.temp ?? 0,
      icon: data.weather?.[0]?.icon ?? "01d",
      main: data.weather?.[0]?.main ?? "Clear",
      cityName,
      locationLabel
    };
  } catch (error) {
    weatherError.value = error instanceof Error ? error.message : "날씨 조회 중 오류가 발생했습니다.";
  } finally {
    weatherLoading.value = false;
  }
};

watch(selectedLocation, (locationName) => {
  if (!locationName) return;
  if (mapInstance.value && window.naver?.maps) {
    const meta = locationMeta[locationName];
    if (meta) {
      mapInstance.value.setCenter(new window.naver.maps.LatLng(meta.lat, meta.lng));
      mapInstance.value.setZoom(14);
    }
  }
  void fetchWeather(locationName);
}, { immediate: true });

watch(zoom, (newZoom) => {
  if (mapInstance.value && window.naver?.maps) {
    mapInstance.value.setZoom(Math.max(10, Math.min(newZoom, 18)));
  }
});

watch([backendPlaces, () => props.posts], () => {
  if (isMapReady.value && mapInstance.value && window.naver?.maps) {
    renderMap();
  }
}, { deep: true });

const loadPlaces = async () => {
  mapLoading.value = true;
  mapError.value = null;

  try {
    const places = await fetchPlaces();
    backendPlaces.value = places;
  } catch (error) {
    mapError.value = error instanceof Error ? error.message : "장소 정보를 불러오지 못했습니다.";
  } finally {
    mapLoading.value = false;
  }
};

onMounted(() => {
  void loadPlaces();
  void initializeMap();
});

onBeforeUnmount(() => {
  clearMarkers();
  mapInstance.value?.destroy?.();
  mapInstance.value = null;
});
</script>

<template>
  <div class="flex-1 w-full h-full relative overflow-hidden bg-[#edeef0] select-none">
    <div class="absolute top-4 left-4 z-10 w-[calc(100%-2rem)] max-w-sm">
      <div class="flex items-center bg-white/95 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 focus-within:border-[#006c49] transition-all">
        <Search :size="18" class="text-gray-400 mr-2" />
        <input
          class="bg-transparent border-none outline-none font-body-sm text-sm text-gray-800 w-full placeholder-gray-400"
          placeholder="Search area, sports, or park..."
          type="text"
          v-model="searchQuery"
        />
      </div>

      <div v-if="mapLoading" class="mt-2 rounded-full bg-white/90 px-3 py-2 text-xs text-gray-600 shadow-sm">
        장소 정보를 불러오는 중입니다...
      </div>
      <div v-else-if="mapError" class="mt-2 rounded-full bg-white/90 px-3 py-2 text-xs text-amber-700 shadow-sm">
        {{ mapError }}
      </div>
      <div v-else-if="weatherLoading" class="mt-2 rounded-full bg-white/90 px-3 py-2 text-xs text-gray-600 shadow-sm">
        날씨 정보를 불러오는 중입니다...
      </div>
      <div v-else-if="weather" class="mt-2 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs text-gray-700 shadow-sm">
        <CloudSun :size="16" class="text-[#006c49]" />
        <span class="font-semibold text-gray-800">{{ weather.cityName }}</span>
        <span>· {{ weather.locationLabel }}</span>
        <span>· {{ selectedLocation }}</span>
        <span>· {{ weather.description }}</span>
        <span class="font-semibold text-[#006c49]">{{ Math.round(weather.temp) }}°C</span>
      </div>
      <div v-else-if="weatherError" class="mt-2 rounded-full bg-white/90 px-3 py-2 text-xs text-amber-700 shadow-sm">
        {{ weatherError }}
      </div>
    </div>

    <div class="absolute inset-0 w-full h-full">
      <div ref="mapContainer" class="absolute inset-0 w-full h-full"></div>

      <div v-if="mapError" class="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 px-6 text-center">
        <div class="rounded-2xl bg-white/90 p-6 shadow-lg max-w-md">
          <p class="text-sm font-semibold text-gray-700">지도 연동 준비 중</p>
          <p class="mt-2 text-sm text-gray-500">{{ mapError }}</p>
          <p class="mt-3 text-xs text-gray-400">네이버 지도 인증이 실패하면 이 안내만 보이도록 처리했습니다.</p>
        </div>
      </div>
    </div>

    <div class="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <button
        @click="zoom = Math.min(zoom + 1, 18)"
        class="bg-white hover:bg-gray-50 text-gray-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 rounded-full p-2.5 transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center h-10 w-10"
        aria-label="Zoom in"
      >
        <Plus :size="18" />
      </button>
      <button
        @click="zoom = Math.max(zoom - 1, 10)"
        class="bg-white hover:bg-gray-50 text-gray-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 rounded-full p-2.5 transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center h-10 w-10"
        aria-label="Zoom out"
      >
        <Minus :size="18" />
      </button>
    </div>

    <div class="absolute bottom-6 right-6 flex flex-col gap-3 z-10 items-end">
      <button
        @click="emit('openAIDrawer')"
        class="relative w-14 h-14 bg-[#006c49] hover:bg-[#005236] text-white rounded-full shadow-[0_8px_24px_rgba(0,108,73,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border border-[#6ffbbe]/20"
        aria-label="AI Coach Companion"
      >
        <span class="absolute inset-0 rounded-full bg-[#10b981]/20 animate-pulse"></span>
        <Bot :size="26" class="relative z-10 text-[#6ffbbe] group-hover:rotate-6 transition-transform" />
        <span class="absolute -top-1 -left-1 bg-[#10b981] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white uppercase tracking-wider">AI</span>
      </button>

      <button
        @click="emit('openCreateModal')"
        class="w-14 h-14 bg-[#10b981] hover:bg-[#006c49] text-white rounded-full shadow-[0_8px_24px_rgba(16,185,129,0.35)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
        aria-label="Create session"
      >
        <Plus :size="28" class="group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>

    <Transition name="fade">
      <div v-if="selectedLocation && locationGroups[selectedLocation]" class="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center bg-black/25 backdrop-blur-xs z-20 p-4">
        <div class="bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col relative animate-popup">
          <button
            @click="selectedLocation = null"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1.5 rounded-full z-10 transition-colors"
          >
            <Plus :size="20" class="rotate-45" />
          </button>

          <div class="p-6 pb-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-headline-lg text-[#191c1e] text-xl font-bold tracking-tight">
                  {{ selectedLocation }}
                </h3>
                <p class="font-body-sm text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin :size="14" class="text-gray-400" />
                  {{ locationGroups[selectedLocation].address }}
                </p>
              </div>
              <div class="rounded-full bg-[#006c49]/10 px-2.5 py-1 text-[11px] font-semibold text-[#006c49]">
                {{ locationGroups[selectedLocation].posts.length }}개 모임
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mt-3">
              <span class="bg-[#006c49]/10 text-[#006c49] text-xs font-semibold px-3 py-1 rounded-full">
                {{ locationGroups[selectedLocation].posts.length }} Posts
              </span>
              <span class="bg-[#64f9bc]/15 text-[#00714e] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Star :size="12" class="fill-[#00714e]" />
                {{ locationGroups[selectedLocation].rating }} 평점
              </span>
              <span v-if="weather" class="bg-sky-50 text-sky-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <CloudSun :size="12" />
                {{ weather.cityName }} · {{ weather.locationLabel }} · {{ weather.description }} · {{ Math.round(weather.temp) }}°C
              </span>
            </div>
          </div>

          <div class="bg-[#edeef0]/60 p-5 border-t border-gray-100 flex items-center justify-between min-h-[190px]">
            <div v-if="locationGroups[selectedLocation].posts.length === 0" class="text-center w-full py-8 text-gray-400 text-sm">
              이 위치에 등록된 모집글이 없습니다.<br/>
              새로운 모임을 만들어보세요!
            </div>

            <template v-else>
              <button
                @click="handlePrevCarousel($event, locationGroups[selectedLocation!].posts)"
                :disabled="locationGroups[selectedLocation].posts.length <= 1"
                class="w-10 h-10 rounded-full bg-white text-gray-600 hover:text-[#006c49] hover:shadow-md shadow-sm border border-gray-100 flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0"
                aria-label="이전 게시글"
              >
                <ChevronLeft :size="20" />
              </button>

              <div class="flex-1 mx-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                <div v-if="locationGroups[selectedLocation].posts[carouselIndex]" class="flex flex-col h-full justify-between">
                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <span :class="`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                        locationGroups[selectedLocation].posts[carouselIndex].status === '모집중' ? 'bg-[#10b981]/10 text-[#006c49]' : 'bg-gray-100 text-gray-500'
                      }`">
                        {{ locationGroups[selectedLocation].posts[carouselIndex].status }}
                      </span>
                      <span class="text-xs text-gray-400 font-medium">
                        {{ locationGroups[selectedLocation].posts[carouselIndex].createdAt }}
                      </span>
                    </div>

                    <h4 class="font-headline-md text-base text-gray-900 font-bold tracking-tight line-clamp-1">
                      {{ locationGroups[selectedLocation].posts[carouselIndex].title }}
                    </h4>

                    <div class="flex flex-wrap gap-1 mt-1.5">
                      <span v-for="t in locationGroups[selectedLocation].posts[carouselIndex].tags" :key="t" class="text-[#00714e] text-[11px] font-medium bg-[#4edea3]/10 px-2 py-0.5 rounded-md">
                        #{{ t }}
                      </span>
                    </div>

                    <p class="font-body-sm text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {{ locationGroups[selectedLocation].posts[carouselIndex].description }}
                    </p>
                  </div>

                  <div class="flex items-center justify-between border-t border-gray-50 pt-3 mt-3">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                        {{ locationGroups[selectedLocation].posts[carouselIndex].author[0] }}
                      </div>
                      <span class="text-xs font-semibold text-gray-600">
                        User8429
                      </span>
                    </div>

                    <button
                      @click="emit('selectPost', locationGroups[selectedLocation!].posts[carouselIndex])"
                      class="text-xs font-bold text-[#006c49] hover:text-[#005236] transition-colors flex items-center gap-0.5 group cursor-pointer"
                    >
                      상세보기
                      <ChevronRight :size="14" class="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                @click="handleNextCarousel($event, locationGroups[selectedLocation!].posts)"
                :disabled="locationGroups[selectedLocation].posts.length <= 1"
                class="w-10 h-10 rounded-full bg-white text-gray-600 hover:text-[#006c49] hover:shadow-md shadow-sm border border-gray-100 flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0"
                aria-label="다음 게시글"
              >
                <ChevronRight :size="20" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes popupIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-popup {
  animation: popupIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
