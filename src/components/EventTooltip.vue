<template>
  <div class="event-content-category">
    <div class="event-content" v-html="event.description"></div>
  </div>
</template>
<script>
export default {
  props: {
    event: {
      type: Object
    }
  }
};
</script>
<style>
.has-tooltip {
  color: #f2bf4e;
  cursor: pointer;
  font-family: sans-serif;
  font-size: 20px;
  position: relative;
  text-align: center;
  display: inline-block;
  margin-right: 5px;
  -webkit-transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
}

.has-tooltip::after{
  content: url("../assets/img/question.svg");
  position: absolute;
  top: -8px;
  right: -8px;


}
.has-tooltip .tooltip {
  /*display: inline;*/
  display: flex;
  justify-content: center;
  flex-direction: column;
  font-size: 15px;
  align-items: center;
  background-image: url("../assets/img/page.png");
  background-position: center;
  color: #000;
  opacity: 0;
  padding: 3em;
  position: absolute;
  z-index: 20000000;
  visibility: hidden;
  width: 420px;
  height: 334px;
  -webkit-transition: all 0.25s ease-out;
  -moz-transition: all 0.25s ease-out;
  -ms-transition: all 0.25s ease-out;
  -o-transition: all 0.25s ease-out;
  transition: all 0.25s ease-out;
}
.has-tooltip .tooltip h1 {
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 8px;
  color: #42280c;
  font-family: 'Simphonia-Deco', sans-serif;
}

.has-tooltip .tooltip:before {
  content: " ";
  display: block;
  height: 1em;
  position: absolute;
  width: 100%;
}

.has-tooltip:hover .tooltip {
  opacity: 1;
  visibility: visible;
  -webkit-transform: translateX(0px) translateY(0px) !important;
  -moz-transform: translateX(0px) translateY(0px) !important;
  -ms-transform: translateX(0px) translateY(0px) !important;
  -o-transform: translateX(0px) translateY(0px) !important;
  transform: translateX(0px) translateY(0px) !important;
}

.has-tooltip .tooltip {
  bottom: 100%;
  top: auto;
  left: -8em;
  right: auto;
  margin-left: 0%;
  margin-right: auto;
  margin-bottom: 0.6em;
  color: #42280C;
  font-family: 'Raleway-SemiBold', sans-serif;
  -webkit-transform: translateX(0px) translateY(10px);
  -moz-transform: translateX(0px) translateY(10px);
  -ms-transform: translateX(0px) translateY(10px);
  -o-transform: translateX(0px) translateY(10px);
  transform: translateX(0px) translateY(10px);
}

.has-tooltip .tooltip:before {
  bottom: 0;
  left: -3em;
  height: 100%;
  width: 100%;
  /*background-image: url('../assets/img/page.png');*/
}

@media screen and (max-width: 880px) {
  .has-tooltip .tooltip {
    left: -200px;
    bottom: -80px;
    z-index: 30000000;
    width: 380px;
  }
  .has-tooltip {
    font-size: 16px;
  }
}
</style>
