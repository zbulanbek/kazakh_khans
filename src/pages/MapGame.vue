<template>
  <div class="preloader" id="preloader" v-if="isShowPreloader">
    <div class="loading" :class="{ 'not-animation': isShowPreloaderBtn }">
      <div class="progress">
        <img src="../assets/img/icon_logo.svg" class="logo" />
      </div>
    </div>
    <button
      class="start-btn"
      @click="playSoundBackground"
      v-if="isShowPreloaderBtn"
    >
      Начать урок
    </button>
  </div>

  <basic-map
    :eventCategory="eventCategory"
    :mapData="mapData"
    :musices="musices"
    :eventCenter="eventCenter"
    :isPlayBackgroundAudio="isPlayBackgroundAudio"
    @playSound="playSoundBackground"
    @showShowPreloaderBtn="showShowPreloaderBtn"
    v-if="eventCategory.length > 0 && mapData"
  ></basic-map>

  <div class="audio_wrap">
    <audio
      id="background"
      v-if="musices.background"
      :src="musices.background"
      autoplay="autoplay"
    >
      <source :src="musices.background" type="audio/mp3" />
    </audio>
  </div>
</template>
<script>
import BasicMap from "../components/BasicMap.vue";
import axios from "axios";

export default {
  components: {
    BasicMap
  },
  data() {
    return {
      eventCategory: [],
      mapData: null,
      musices: {
        note: "",
        achieve: "",
        attack: "",
        background: ""
      },
      isShowMap: false,
      eventCenter: [],
      backgroundAudio: null,
      isPlayBackgroundAudio: false,
      isShowPreloaderBtn: false,
      isShowPreloader: true,
      backDuration: 1
    };
  },
  created() {
    this.getEvents();
    this.getGeoJson();
    this.getSounds();
  },
  methods: {
    playSoundBackground() {
      this.isPlayBackgroundAudio = !this.isPlayBackgroundAudio;
      var background = document.getElementById("background");
      document.getElementById("background").loop = true;
      this.isPlayBackgroundAudio ? background.play() : background.pause();
      if (this.isShowPreloaderBtn) {
        this.isShowPreloaderBtn = false;
        this.hidePreloader();
      }
    },
    getEvents() {
      axios
        .get("https://api.jaryq-academy.kz/dev/geojson/events")
        .then((response) => {
          this.eventCategory = response.data;
          this.eventCenter = response.data[0].events[0].center.split(",");
          this.isShowMap = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    getSounds() {
      axios
        .get("https://api.jaryq-academy.kz/dev/geojson/sounds")
        .then((response) => {
          this.musices = response.data;
          //this.isShowPreloaderBtn = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    getGeoJson() {
      axios
        .get("https://api.jaryq-academy.kz/dev/geojson")
        .then((response) => {
          this.mapData = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    showShowPreloaderBtn(){
      this.isShowPreloaderBtn = true;
    },
    hidePreloader() {
      this.isShowPreloader = false;
    }
  }
};
</script>
