// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  ssr: false,
  app: {
    baseURL: '/Terminator/',
    buildAssetsDir: '/_nuxt/',
    head: {
      title: 'Terminator - Solver para o Termo',
      meta: [
        { name: 'description', content: 'Solver avançado para o jogo Termo, Dueto e Quarteto.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/Terminator/favicon.ico' }
      ]
    }
  },
  nitro: {
    baseURL: '/Terminator/',
  },
})
