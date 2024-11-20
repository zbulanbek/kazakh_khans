import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import "/src/styles/app.scss"

var VueScrollTo = require('vue-scrollto');



const app = createApp(App);

app
.use(router)
.use(VueScrollTo, {
     container: "body",
     duration: 900,
     easing: "ease",
     offset: -200,
     force: true,
     cancelable: true,
     onStart: false,
     onDone: false,
     onCancel: false,
     x: false,
     y: true
 });
app.mount('#app');
