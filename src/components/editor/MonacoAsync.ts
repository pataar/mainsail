import Vue from 'vue'

/**
 * Load code mirror into a chunk
 */
export default Vue.component(
    'MonacoAsync',
    // A dynamic import returns a Promise.
    () => import('./Monaco.vue')
)
