<template>
   <div class="empty-block"></div>
  <header class="nav">
    <div class="logo_wrap">
      <img src="../assets/img/logo.svg" class="logo" />
    </div>


    <div class="nav-bar">
      <button class="nav-bar__btn" @click="$emit('playSound')">
        <img src="../assets/img/no-sound.png" v-if="isPlayBackgroundAudio"/> 
        <img src="../assets/img/audio-speaker-on.png" v-else/> 
      </button>
      <button class="nav-bar__btn"><img src="../assets/img/nas.svg" /></button>
      <button class="nav-bar__btn"><img src="../assets/img/exit.svg" /></button>
    </div>

    <div class="mobile-title">
      <p>История Казахстана</p>
      <p>c <img src="../assets/img/icon_logo.svg" class="mini_logo"/><b class="primary">Jaryq</b> <b class="active">Academy</b> -</p>
      <p>просто и наглядно</p>
    </div>
  </header>

  <div id="map" class="invisible"></div>

  
  <div class="wrap">
      <div class="line-gradient-wrap">
        <img src="../assets/img/line.svg">
      </div>
  <!--    <img src="../assets/img/line.svg" class="line-gradient"> -->
    <div
      class="timeline-slice"
      v-for="category in eventCategory"
      :key="category.id"    >

      <div
        class="event"
        :class="{
          important: event.type == 'history' || event.type == 'event' || event.type == 'result',
          result: event.type == 'result'
        }"
        :id="'uniq' + event.id"
        :data-hash="event.id"
        :data-era="category.id"
        :data-zoom="event.zoom"
        :data-zoommobile="event.zoom_mobile"
        :data-centermobile="event.center_mobile"
        :data-center="event.center"
        :data-speed="event.speed"
        :data-eventtitle="event.event_title"
        :data-eventdescription="event.event_description"
        :data-sound="event.sound"
        :data-categorytitle="category.title"
        v-for="event in category.events"
        :key="event.id"
      >
        <div class="events-date">{{ event.title }}</div>
        <div class="events-subtitle" v-if="event.subtitle ">{{ event.subtitle }}</div>

        <event-tooltip :event="event"></event-tooltip>
      </div>
    </div>
  </div>

  <div class="helper" :class="{ active: isShowHelper }">
    <ul>
      <li
        :id="'era-' + category.id"
        class="helper-hash"
        v-for="category in eventCategory"
        :key="category.id"
        :class="{ active: currentHelper == category.id }"
      >
        <a v-scroll-to="'#uniq' + category.events[0].id">
          {{ category.title }}
        </a>
      </li>
    </ul>
  </div>

  <div class="modal-event-top" :class="{ active: activeEvent.is_active }">
    <img src="../assets/img/banners.png" class="banner" />
    <p class="title">{{ activeEvent.title }}</p>
    <p class="subtitle">{{ activeEvent.description }}</p>
  </div>
 <div class="empty-block"></div>
  <div class="audio_wrap">
      <audio
      id="note" 
      v-if="musices"
      :src="musices.note"
      preload="auto"
    >
      note <code>audio</code> element.
    </audio>

    <audio
      id="achieve"
      v-if="musices.achieve"
      :src="musices.achieve"
      preload="auto"
    >
      achieve <code>audio</code> element.
    </audio>

    <audio
      id="attack"
      v-if="musices.attack"
      :src="musices.attack"
      preload="auto"
    >
      attack <code>audio</code> element.
    </audio>
  </div>
</template>
<script>
import maplibregl from "maplibre-gl";
import eventCategoryMain from "../assets/json/EventCategory.json";
import linesFromBack from "../assets/json/Lines.json";
import rufulllinesFromBack from "../assets/json/Rufulllines.json";
import mapsnlinesFromBack from "../assets/json/Mapsnlines.json";
import dotsFromBack from "../assets/json/Dots.json";
import iconDotsBack from "../assets/json/IconDots.json";
import PolygonNameBack from "../assets/json/PolygonName.json";
import EventTooltip from "../components/EventTooltip.vue";
import ImageBack from "../assets/json/Image.json";
import axios from "axios";

export default {
  components: {
    EventTooltip
  },
  data() {
    return {
      map: null,
      popup: null,
      center: [76.889709, 43.238949],
      eventCategory: eventCategoryMain,
      apiKey: "U9tv2P2BxMbgksJoWtNa",
      activeCategory: "",
      mapData: {
        lines: linesFromBack,
        rufulllines: rufulllinesFromBack,
        mapsnlines: mapsnlinesFromBack,
        dots: dotsFromBack,
        markers: iconDotsBack,
        polygonName: PolygonNameBack,
        images: ImageBack
      },
      fulllines: {
        data: [],
        fulllinesState: [],
        fulllinesVisible: false
      },
      rufulllines: {
        data: [],
        rulinesState: [],
        rulinesVisible: false
      },
      polygonName: {
        data: [],
        state: [],
        visible: false
      },
      mapsnlines: {
        data: [],
        mapsnlinesState: [],
        mapsnlinesVisible: false
      },
      dots: {
        data: [],
        dotsState: [],
        dotsVisible: false
      },
      lastScrollPosition: 0,
      events: null,
      heights: {
        wHeight: 0,
        wHalfHeight: 0
      },
      current: {
        zoom: false,
        center: false,
        speed: false
      },
      setted: {
        newZoom: false,
        newCenter: false,
        newHash: false
      },
      active: {
        era: false,
        hash: false,
        event: false
      },
      activeEvent: {
        title: "",
        description: "",
        is_active: false
      },
      lastHashChange: false,
      lastStaticChange: false,
      flying: false,
      tempActiveHash: -1,
      animateStart: false,
      ticking: false,
      isShowHelper: false,
      hoveredStateId: null,
      currentHelper: null,
      hash: this.$route.hash,
      animateddots: [],
      currentMarkers: [],
      backgroundAudio: null,
      musices: {
        note: 'https://jaryq-academy.kz/history-map/note.mp3',
        achieve: 'https://jaryq-academy.kz/history-map/achieve.mp3',
        attack: 'https://jaryq-academy.kz/history-map/attack.mp3'
      },
       polygon: {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              9.65025663353802,
              60.24390087694769
            ],
            [
              9.65025663353802,
              16.74529196511459
            ],
            [
              140.29325107306374,
              16.74529196511459
            ],
            [
              140.29325107306374,
              60.24390087694769
            ],
            [
              9.65025663353802,
              60.24390087694769
            ]
          ]
        ],
        "type": "Polygon"
      }
    },
    };
  },
  created(){
    this.getSounds();
  },
  mounted() {
    const mapengine = maplibregl;

   this.events = document.querySelectorAll(".event");
    this.heights.wHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.getElementsByTagName("body")[0].clientHeight;
    this.heights.wHalfHeight = this.heights.wHeight / 2;
    this.lastHashChange = performance.now();
    this.lastStaticChange = performance.now();



  this.map = new mapengine.Map({
      container: "map",
        style: {
            version: 8,
            sources: {
                osm: {
                    type: 'raster',
                    tiles: ["https://art-z.me/pg/tiles/{z}/{y}/{x}.png?sd78s"],
                    tileSize: 256
                }
   },
            layers: [{
                id: 'osm',
                type: 'raster',
                source: 'osm',
            }],
        },

         // style: {
        // 'version': 8,
        // 'sources': {
        // 'raster-tiles': {
        // 'type': 'raster',
        // 'tiles': [
        // 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg'
        // ],
        // 'tileSize': 256,
        // 'attribution':
        // 'Map tiles by <a target="_top" rel="noopener" href="http://stamen.com">Stamen Design</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
        // }
        // },
        // 'layers': [
        // {
        // 'id': 'simple-tiles',
        // 'type': 'raster',
        // 'source': 'raster-tiles',
        // 'minzoom': 0,
        // 'maxzoom': 22
        // }
        // ]
        // },

      //style: `https://api.maptiler.com/maps/jp-mierune-dark/style.json?key=U9tv2P2BxMbgksJoWtNa`,
       //style: `https://api.maptiler.com/maps/basic/style.json?key=${this.apiKey}`,
      center: this.center,
      zoom: 5,
      antialias: true,
      dragRotate: false,
      minZoom: 2.0,
      maxZoom: 5.49,
      touchZoomRotate: false,
      scrollZoom: false
    });

    this.map.on("load", () => {

        var this__ = this;
    this.map.style.stylesheet.layers.forEach(function(layer) {
        if (layer.type === 'symbol') {
        this__.map.setLayoutProperty(layer.id,"visibility", "none");
      }
    });


      this.map.setPadding({ right: window.innerWidth / 2.5, bottom: 220 });

      if (this.mapData.lines) {
        // lines dashed_lines
        let lines = this.mapData.lines;
        this.fulllines.data = lines.features;

        // rufulllines
        let rufulllines = this.mapData.rufulllines;
        this.rufulllines.data = rufulllines.features;

        //mapsnlines
        let mapsnlines = this.mapData.mapsnlines;
        this.mapsnlines.data = mapsnlines.features;

        //dots
        let dots = this.mapData.dots;
        this.dots.data = dots.features;

        //mapsnlines
        let places = this.mapData.polygonName;
        this.polygonName.data = places.features;

        // let places = this.mapData.dots;
        // this.polygonName.data = dots.features.filter((x) => x.properties.type === 'symbol');

        this.map.addSource("fulllines", {
          type: "geojson",
          data: lines
        });

        this.map.addSource("rulines", {
          type: "geojson",
          data: rufulllines
        });

        this.map.addSource("fullmaps", {
          type: "geojson",
          data: mapsnlines
        });

        this.map.addSource("fulldots", {
          type: "geojson",
          data: dots
        });

        this.map.addSource("places", {
          type: "geojson",
          data: places
        });

        // let mapsnlinesd = this.polygon;
        //  this.map.addSource("fullmapsd", {
        //   type: "geojson",
        //   data: mapsnlinesd
        // });

        this.map.addLayer({
          id: "places",
          type: "symbol",
          source: "places",
          layout: {
            "text-field": ["get", "title"],
            "text-variable-anchor": ["top", "bottom", "left", "right"],
            "text-radial-offset": 0.2,
            "text-justify": "auto",
            "text-max-width": 100,
            "text-size": ["get", "text_size"],
            "text-rotate": ["get", "text_rotate"],
            visibility: "none"
          },
          paint: {
            "text-color": ["get", "color"],
            "text-halo-width": 1
          }
        });

        this.map.addLayer({
          id: "fulllines",
          type: "line",
          source: "fulllines",
          layout: {
            visibility: "none"
          },
          minzoom: 2,
          maxzoom: 7,
          paint: {
            "line-color": [
              "case",
              ["==", ["get", "type"], "dashed"],
              ["get", "color"],
              "black"
            ],
            "line-width": 2,
            "line-opacity": 0.8,
            "line-dasharray": [2, 2]
          },
          filter: ["==", "$type", "LineString"]
        });

        this.map.addLayer({
          id: "rulines",
          type: "line",
          source: "rulines",
          layout: {
            visibility: "none"
          },
          minzoom: 2,
          maxzoom: 9,
          paint: {
            "line-color": [
              "case",
              ["==", ["get", "type"], "line"],
              ["get", "color"],
              "black"
            ],
            "line-width": 1,
            "line-opacity": 0.8
          }
        });



        this.map.addLayer({
          id: "fullmaps",
          type: "fill",
          layout: {
            visibility: "none"
          },
          minzoom: 2,
          maxzoom: 7,
          source: "fullmaps",
          paint: {
            "fill-color": ["get", "color"],

            "fill-outline-color": ["get", "color_outline"],

            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.12,
              0.05
            ]
          }
        });


        for (let p = 0; p < this.mapData.images.images.length; p++) {
          this.map.loadImage(this.mapData.images.images[p].source,
            (err, image) => {
            if (err) throw err;
            this.map.addImage(this.mapData.images.images[p].name, image);
          });
        }
        
        

        // this.map.addLayer({
        //   id: "fullmaps",
        //   type: "fill",
        //   layout: {
        //     visibility: "none"
        //   },
        //   minzoom: 2,
        //   maxzoom: 7,
        //   source: "fullmaps",
        //   paint: {
        //     'fill-pattern': ["get", "nameSource"],
        //   },
        //   // paint: {
        //   //   "fill-color": ["get", "color"],

        //   //   "fill-outline-color": ["get", "color_outline"],

        //   //   "fill-opacity": [
        //   //     "case",
        //   //     ["boolean", ["feature-state", "hover"], false],
        //   //     0.3,
        //   //     0.2
        //   //   ]
        //   // }
        // });

        this.map.addLayer({
          id: "fulldots",
          type: "circle",
          layout: {
            visibility: "none"
          },
          minzoom: 3,
          maxzoom: 9,
          source: "fulldots",
          paint: {
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-width": [
              "case",
              ["==", ["get", "type"], "dot"],
              5,
              0
            ],
            "circle-stroke-opacity": 0.1,
            "circle-color": ["get", "color"],
            "circle-radius": {
              base: 5,
              stops: [
                [2, 2],
                [4, 4]
              ]
            }
          }
          //filter: ["==", ["get", "type"], "dot"]
        });

        //  this.map.addLayer({
        //   id: "fullmapsd",
        //   type: "fill",
        //   layout: {
        //     visibility: "visible"
        //   },
        //   minzoom: 2,
        //   maxzoom: 7,
        //   source: "fullmapsd",
        //   paint: {
        //     "fill-color": '#0a162c',

        //     "fill-outline-color": '#0a162c',

        //     'fill-opacity': 0.6
        //   }
        // });

        this.popup = new maplibregl.Popup({ closeOnClick: false });

        this.map.on("mousemove", "fullmaps", (e) => {
          let targetList = e.originalEvent.composedPath();

          let allow = true;

          if (targetList) {
            for (let p = 0; p < targetList.length; p++) {
              let el = targetList[p];
              if (el.classList) {
                if (
                  el.classList.contains("movement") &&
                  !el.classList.contains("invisible")
                ) {
                  allow = false;
                }
              }
            }
          }

          if (allow) {
            if (e.features.length > 0) {
              if (this.hoveredStateId !== null) {
                this.map.setFeatureState(
                  { source: "fullmaps", id: this.hoveredStateId },
                  { hover: false }
                );
              }

              this.hoveredStateId = e.features[0].id;

              this.map.getCanvas().style.cursor = "pointer";

              this.popup
                .setLngLat(e.lngLat)
                .setHTML(
                  '<div class="map-popup">' +
                    e.features[0].properties.description +
                    "</div>"
                )
                .addTo(this.map);

              this.map.setFeatureState(
                { source: "fullmaps", id: this.hoveredStateId },
                { hover: true }
              );
            }
          }
        });

        this.map.on("mouseleave", "fullmaps", (e) => {
          let targetList = e.originalEvent.composedPath();

          let allow = true;

          if (targetList) {
            for (let p = 0; p < targetList.length; p++) {
              let el = targetList[p];
              if (el.classList) {
                if (
                  el.classList.contains("movement") &&
                  !el.classList.contains("invisible")
                ) {
                  allow = false;
                }
              }
            }
          }

          if (allow) {
            if (this.hoveredStateId !== null) {
              this.map.setFeatureState(
                { source: "fullmaps", id: this.hoveredStateId },
                { hover: false }
              );
            }
            this.hoveredStateId = null;
            this.popup.remove();
          }
        });

        this.map.on("mousemove", "fulldots", (e) => {
          let targetList = e.originalEvent.composedPath();
          let allow = true;

          for (let p = 0; p < targetList.length; p++) {
            let el = targetList[p];
            if (el.classList) {
              if (
                el.classList.contains("movement") &&
                !el.classList.contains("invisible")
              ) {
                allow = false;
              }
            }
          }

          if (allow) {
            if (e.features.length > 0) {
              if (this.hoveredStateId !== null) {
                this.map.setFeatureState(
                  { source: "fulldots", id: this.hoveredStateId },
                  { hover: false }
                );
              }

              this.hoveredStateId = e.features[0].id;

              this.map.getCanvas().style.cursor = "pointer";

              this.popup
                .setLngLat(e.lngLat)
                .setHTML(
                  '<div class="map-popup">' +
                    e.features[0].properties.description +
                    "</div>"
                )
                .addTo(this.map);

              this.map.setFeatureState(
                { source: "fulldots", id: this.hoveredStateId },
                { hover: true }
              );
            }
          }
        });

        this.map.on("mouseleave", "fulldots", (e) => {
          let targetList = e.originalEvent.composedPath();
          let allow = true;

          for (let p = 0; p < targetList.length; p++) {
            let el = targetList[p];
            if (el.classList) {
              if (
                el.classList.contains("movement") &&
                !el.classList.contains("invisible")
              ) {
                allow = false;
              }
            }
          }

          if (allow) {
            if (this.hoveredStateId !== null) {
              this.map.setFeatureState(
                { source: "fulldots", id: this.hoveredStateId },
                { hover: false }
              );
            }
            this.hoveredStateId = null;
            this.popup.remove();
          }
        });

        // let anmtd = this.mapData.markers.features;
        let anmtd = this.mapData.markers.features.concat(this.mapData.polygonName.features);

        for (let i = 0; i < anmtd.length; i++) {
          let f = anmtd[i];
          this.animateddots.push(f);

          const el = document.createElement("div");
          el.id = "map" + f.id + "_dot";
          el.dataset.coords = f.geometry.coordinates;

           if(f.properties.type == 'icon_animate'){
            let color = f.properties.color ? f.properties.color : 'red';
            el.classList = "movement static invisible  ";
            el.innerHTML = ' <div class="ringring" style="border-color:'+ color +'"></div> <div class="circle" style="background-color:'+ color +'"></div>';

          }else if(f.properties.type == 'symbol'){
            let color = f.properties.color ? f.properties.color : 'red';
            let text_size = f.properties.text_size ? f.properties.text_size : '16px';
            let text_rotate = f.properties.text_rotate ? f.properties.text_rotate : 0;

            el.classList = "movement static invisible  ";
            el.innerHTML = `<div class="polygon_name" style="color:${color}; font-size: ${text_size}px; transform: rotate(${text_rotate}deg);"> ${f.properties.title} </div>`;
           }else if(f.properties.type == 'icon'){
            
            el.classList = "movement invisible ";
            let background = `background-image: url("${f.properties.image}")`;
            el.setAttribute("style", background);

          }else{

            let color = f.properties.color ? f.properties.color : 'white';
            el.classList = "movement static invisible  ";
            let image = f.properties.image ? `<img src="${f.properties.image}" />` : "";
            el.innerHTML = `<div class="static_icon">
                ${image}
              <p style="color:${color};">${f.properties.title}</p>
              <div class="circle-static" style="background-color:${color}">
              </div>
            </div>`;
          }


          let _this = this;
          el.addEventListener("mouseover", function () {
            _this.map.getCanvas().style.cursor = "pointer";
            if (!el.classList.contains("invisible")) {
              _this.popup
                .setLngLat(f.geometry.coordinates)
                .setHTML(
                  '<div class="map-popup"><b>' +
                    f.properties.description +
                    "</b></div>"
                )
                .addTo(_this.map);
            }
          });

          el.addEventListener("mouseout", function () {
            //this.map.getCanvas().style.cursor = "";
            if (!el.classList.contains("invisible")) {
              _this.popup.remove();
            }
          });

          let marker = new maplibregl.Marker(el)
            .setLngLat(f.geometry.coordinates)
            .setPopup(_this.popup)
            .addTo(_this.map);

          _this.currentMarkers.push(marker);
        }
      }

       if (window.location.hash) {
        let numHash = window.location.hash.replace(/\D/g, "");

        /* if (!numHash) {
                         numHash = 'intro';
                     }*/

        const element = document.querySelector("#uniq" + numHash);

        if (element) {
          const rect = element.getBoundingClientRect(); // get rects(width, height, top, etc)
          const viewHeight = this.heights.wHeight;

          window.scrollTo(0, rect.top - viewHeight / 4);
        }
      } else {
        _this.moveMap(0);

        
      }

      document.getElementById("map").classList.remove("invisible");

    });
    let _this = this;
    document.addEventListener("scroll", function () {
      _this.lastScrollPosition = window.scrollY;

      if (!_this.ticking) {
        window.requestAnimationFrame(function () {
          _this.moveMap(_this.lastScrollPosition);

          _this.ticking = false;
        });

        _this.ticking = true;
      }
    });

    _this.map.on("flystart", function () {
      _this.flying = true;
    });
    _this.map.on("flyend", function () {
      _this.flying = false;
    });
    _this.map.on("moveend", function () {
      _this.flying = false;
    });

    this.setMoveHover();   

    
  },
  methods: {
    getSounds(){
       axios
        .get("https://api.jaryq-academy.kz/dev/geojson/sounds")
        .then((response) => {
          this.musices = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    setMoveHover() {
      //hover play music
      var note = document.getElementById("note");
      const hover_items = document.querySelectorAll(".has-tooltip");

      hover_items.forEach((el) =>
        el.addEventListener("mouseover", () => {
          note.play();
        })
      );
    },
    isVisible(el) {
      let _this = this;
      if (_this.active.event === el.id) return;

      const { top, bottom } = el.getBoundingClientRect();

      return (
        top < _this.heights.wHalfHeight && bottom > _this.heights.wHalfHeight
      );
    },
    getActiveEvent() {
      // список div class .events
      let _this = this;
      let tempEv = false;

      for (let i = 0; i < _this.events.length; i++) {
        let event = _this.events[i];
        //isVisible check this div visible если да возращаем div если нет false
        if (_this.isVisible(event)) {
          tempEv = event;
          break;
        }
      }

      return tempEv;
    },
    moveMap(scrollPos) {
      let event = this.getActiveEvent();
      let _this = this;
      let achieve_audio = document.getElementById("achieve");
      let attack_audio = document.getElementById("attack");

      if (event) {
        _this.setted.newHash = true;
        _this.active.hash = event.dataset.hash;

        let wWidth = window.innerWidth;

        let zoom = wWidth > 600 ? event.dataset.zoom : event.dataset.zoom - 2;
        let center = event.dataset.center;
        let speed = event.dataset.speed;
        let event_title = event.dataset.eventtitle;
        let event_description = event.dataset.eventdescription;
        let event_sound = event.dataset.sound;

        if (center) {
          if (_this.current.center != center) {
            _this.setted.newCenter = true;
          }

          if (_this.current.zoom != zoom) {
            _this.setted.newZoom = true;
          }

          _this.current.speed = speed;
          _this.current.zoom = zoom;
          _this.current.center = center;
        }

        if (_this.active.event) {
          document
            .getElementById(_this.active.event)
            .classList.remove("active");
        }
        _this.active.event = event.id;

        event.classList.add("active");

        if (event_title || event_description) {
          _this.activeEvent.title = event_title;
          _this.activeEvent.description = event_description;
          _this.activeEvent.is_active = true;
          achieve_audio.play();
        } else {
          _this.activeEvent.is_active = false;
          // _this.activeEvent.title = "";
          // _this.activeEvent.description = "";
          //achieve_audio.pouse();
        }

        //set sound
        if (event_sound) {
          attack_audio.play();
        }

        //helper show
        if (!_this.active.era) {
          if (_this.active.event != "uniqintro") {
            _this.isShowHelper = true;
          }
        }

        //helper show era block helper
        if (_this.active.era) {
          this.currentHelper = _this.active.era;
        }

        _this.active.era = event.dataset.era;
        this.currentHelper = _this.active.era;

        if (performance.now() - _this.lastHashChange > 1200) {
          if (scrollPos < _this.heights.wHeight / 2) {
            _this.isShowHelper = false;
            _this.active.era = false;
          }

          _this.lastHashChange = performance.now();
        }

        _this.setted.newHash = false;
      } else {
        if (!_this.flying && !_this.setted.newHash) {
          if (
            _this.tempActiveHash != _this.active.hash ||
            !_this.animateStart
          ) {
            _this.animateStart = true;
            _this.setFilterLines();
            _this.setFilterRuLines();
            _this.setFilterMaps();
            //_this.setPolygonName();
            new Promise(function (resolve) {
              resolve();
            })
              .then(function (result) {
                _this.setFilterDots();
                return result;
              })
              .then(function (result) {
                _this.animateMove(scrollPos);
                _this.tempActiveHash = _this.active.hash;
                _this.animateStart = false;
                return result;
              });
          }

          if (
            _this.tempActiveHash == _this.active.hash &&
            !_this.animateStart
          ) {
            if (performance.now() - _this.lastStaticChange > 30) {
              _this.animateMove(scrollPos);
              _this.lastStaticChange = performance.now();
              _this.animateStart = false;
            }
          }

          if (scrollPos < _this.heights.wHeight / 2) {
            _this.isShowHelper = false;
            _this.active.era = false;
          }
        }

        if (_this.setted.newZoom && _this.setted.newCenter) {
          let pitch = 0;
          if (_this.current.zoom > 5.4) {
            pitch = 45;
          }
          _this.flying = true;
          _this.setted.newZoom = false;
          _this.setted.newCenter = false;
          let center = this.current.center.split(",");

          _this.map.flyTo({
            center: [center[0], center[1]],
            zoom: _this.current.zoom,
            speed: _this.current.speed,
            pitch: pitch
          });
        }

        if (!_this.setted.newZoom && _this.setted.newCenter) {
          _this.flying = true;
          _this.setted.newZoom = false;
          _this.setted.newCenter = false;
          let center = _this.current.center.split(",");

          this.map.easeTo({
            center: [center[0], center[1]],
            speed: _this.current.speed
          });
        }
      }
    },
    setFilterLines() {
      if (this.fulllines.data.length) {
        let fulllinesStateTemp = "";
        const filteredlines = [];

        for (const feature of this.fulllines.data) {
          const line_hash = feature.properties.hash;
          const line_hash_end = feature.properties.hash_end;

          if (
            line_hash <= this.active.hash &&
            line_hash_end >= this.active.hash
          ) {
            filteredlines.push(feature);
            fulllinesStateTemp += feature.properties.id;
          }
        }

        if (fulllinesStateTemp != this.fulllines.fulllinesState) {
          this.fulllines.fulllinesState = fulllinesStateTemp;
          if (filteredlines.length) {
            if (!this.fulllines.fulllinesVisible) {
              this.fulllines.fulllinesVisible = true;
              this.map.setLayoutProperty("fulllines", "visibility", "visible");
            }

            let filter = [
              "match",
              ["get", "id"],
              filteredlines.map(function (feature) {
                return feature.properties.id;
              }),
              true,
              false
            ];
            this.map.setFilter("fulllines", filter);
          } else {
            this.fulllines.fulllinesVisible = false;
            this.map.setLayoutProperty("fulllines", "visibility", "none");
          }
        }
      }
    },
    setFilterRuLines() {
      if (this.rufulllines.data.length) {
        let rulinesStateTemp = "";
        const filteredrulines = [];

        for (const feature of this.rufulllines.data) {
          const line_hash = feature.properties.hash;
          const line_hash_end = feature.properties.hash_end;

          if (
            line_hash <= this.active.hash &&
            line_hash_end >= this.active.hash
          ) {
            filteredrulines.push(feature);
            rulinesStateTemp += feature.id;
          }
        }

        if (rulinesStateTemp != this.rufulllines.rulinesState) {
          this.rufulllines.rulinesState = rulinesStateTemp;
          if (filteredrulines.length) {
            if (!this.rufulllines.rulinesVisible) {
              this.rufulllines.rulinesVisible = true;
              this.map.setLayoutProperty("rulines", "visibility", "visible");
            }

            let filter = [
              "match",
              ["get", "id"],
              filteredrulines.map(function (feature) {
                return feature.properties.id;
              }),
              true,
              false
            ];
            this.map.setFilter("rulines", filter);
          } else {
            this.rufulllines.rulinesVisible = false;
            this.map.setLayoutProperty("rulines", "visibility", "none");
          }
        }
      }
    },
    setPolygonName() {
      if (this.polygonName.data.length) {
        let rulinesStateTemp = "";
        const filteredrulines = [];

        for (const feature of this.polygonName.data) {
          const line_hash = feature.properties.hash;
          const line_hash_end = feature.properties.hash_end;

          if (
            line_hash <= this.active.hash &&
            line_hash_end >= this.active.hash
          ) {
            filteredrulines.push(feature);
            rulinesStateTemp += feature.id;
          }
        }

        if (rulinesStateTemp != this.polygonName.state) {
          this.polygonName.state = rulinesStateTemp;
          if (filteredrulines.length) {
            if (!this.polygonName.visible) {
              this.polygonName.visible = true;
              this.map.setLayoutProperty("places", "visibility", "visible");
            }

            let filter = [
              "match",
              ["get", "id"],
              filteredrulines.map(function (feature) {
                return feature.properties.id;
              }),
              true,
              false
            ];
            this.map.setFilter("places", filter);
          } else {
            this.polygonName.visible = false;
            this.map.setLayoutProperty("places", "visibility", "none");
          }
        }
      }
    },
    setFilterMaps() {
      if (this.mapsnlines.data.length) {
        let fullmapsStateTemp = "";
        const filteredfullmaps = [];

        for (const feature of this.mapsnlines.data) {
          const line_hash = feature.properties.hash;
          const line_hash_end = feature.properties.hash_end;

          if (
            line_hash <= this.active.hash &&
            line_hash_end >= this.active.hash
          ) {
            filteredfullmaps.push(feature);
            fullmapsStateTemp += feature.id;
          }
        }

        if (fullmapsStateTemp != this.mapsnlines.mapsnlinesState) {
          this.mapsnlines.mapsnlinesState = fullmapsStateTemp;
          if (filteredfullmaps.length) {
            if (!this.mapsnlines.mapsnlinesVisible) {
              this.mapsnlines.mapsnlinesVisible = true;
              this.map.setLayoutProperty("fullmaps", "visibility", "visible");
            }

            let filter = [
              "match",
              ["get", "id"],
              filteredfullmaps.map(function (feature) {
                return feature.properties.id;
              }),
              true,
              false
            ];
            this.map.setFilter("fullmaps", filter);
          } else {
            this.mapsnlines.mapsnlinesVisible = false;
            this.map.setLayoutProperty("fullmaps", "visibility", "none");
          }
        }
      }
    },
    scrollTo() {
      this.$scrollTo(this.activeCategory);
    },
    setFilterDots() {
      if (this.dots.data.length) {
        let fulldotsStateTemp = "";
        const filtereddots = [];

        for (const feature of this.dots.data) {
          const line_hash = feature.properties.hash;
          const line_hash_end = feature.properties.hash_end;

          if (
            line_hash <= this.active.hash &&
            line_hash_end >= this.active.hash
          ) {
            filtereddots.push(feature);

            fulldotsStateTemp += feature.id;
          }
        }

        if (fulldotsStateTemp != this.dots.dotsState) {
          this.dots.dotsState = fulldotsStateTemp;
          if (filtereddots.length) {
            if (!this.dots.dotsVisible) {
              this.dots.dotsVisible = true;
              this.map.setLayoutProperty("fulldots", "visibility", "visible");
            }

            let filter = [
              "match",
              ["get", "id"],
              filtereddots.map(function (feature) {
                return feature.properties.id;
              }),
              true,
              false
            ];

            this.map.setFilter("fulldots", filter);
          } else {
            this.dots.dotsVisible = false;
            this.map.setLayoutProperty("fulldots", "visibility", "none");
          }
        }
      }
    },
    animateMove(scrollPos) {
      const hideanimateddots = [];

      const filteranimateddots = [];
      for (const feature of this.animateddots) {
        const line_hash = feature.properties.hash;
        const line_hash_end = feature.properties.hash_end;

        if (
          line_hash <= this.active.hash &&
          line_hash_end >= this.active.hash
        ) {
          filteranimateddots.push(feature);
        } else {
          hideanimateddots.push(feature);
        }
      }

      if (filteranimateddots) {
        for (let i = 0; i < filteranimateddots.length; i++) {
          let move = filteranimateddots[i];
          let startPos = 0;
          let endPos = 0;

          let hash_start = document.getElementById(
            "uniq" + move.properties.hash
          );
          let hash_end = document.getElementById(
            "uniq" + move.properties.hash_end
          );

          startPos =
            hash_start.getBoundingClientRect().top +
            scrollPos -
            this.heights.wHalfHeight;

          endPos =
            hash_end.getBoundingClientRect().top +
            hash_end.getBoundingClientRect().height +
            scrollPos -
            this.heights.wHalfHeight;

          let progressWidth = endPos - startPos;
          let progressPos = scrollPos - startPos;
          let progressPerc = ((progressPos / progressWidth) * 100).toFixed();
          if (progressPerc > 100) {
            progressPerc = 100;
          }
          if (progressPerc < 0) {
            progressPerc = 0;
          }

          if (move.properties.route) {
            let route = JSON.parse(move.properties.route);

            let coordinates = route.features[0].geometry.coordinates;

            let coordL = coordinates.length;
            let coordP = ((coordL / 100) * progressPerc).toFixed();

            let newPositionCoords = [];
            for (let j = 0; j < coordP; j++) {
              newPositionCoords.push(coordinates[j]);
            }

            let pointCoord = newPositionCoords[coordP - 1];
            if (pointCoord) {
              move.geometry.coordinates = pointCoord;
            }
          }
        }
      }

      // hide invisible
      for (let m = 0; m < this.currentMarkers.length; m++) {
        for (const feature of hideanimateddots) {
          let marker = this.currentMarkers[m];

          if (marker._element.id == "map" + feature.id + "_dot") {
            this.popup.remove();

            marker._element.classList.add("invisible");
          }
        }
      }

      let setPopupHas = false;
      //let setPopupCoords = [];
      let setPopupTitle = "";

      // hide show
      for (let m = 0; m < this.currentMarkers.length; m++) {
        for (const feature of filteranimateddots) {
          let marker = this.currentMarkers[m];

          if (marker._element.id == "map" + feature.id + "_dot") {
            setPopupHas = true;
            if(feature.properties.type == 'icon'){
              setPopupTitle = feature.properties.title;
              marker.setLngLat(feature.geometry.coordinates);
            }
             marker._element.classList.remove("invisible");
          }
        }
      }

      if (setPopupHas) {
        this.popup
          .setHTML(
            '<div class="map-popup move_icon">' + setPopupTitle + "</div>"
          )
          .addTo(this.map);
      }
    }
  }
};
</script>
