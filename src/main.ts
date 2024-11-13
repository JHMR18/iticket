import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@mdi/font/css/materialdesignicons.css'; // Import MDI icons

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi' // Import the MDI icon set

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi', // Set default icon set to MDI
        sets: {
            mdi, // Include MDI icon set
        },
    },
})

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.mount('#app')
