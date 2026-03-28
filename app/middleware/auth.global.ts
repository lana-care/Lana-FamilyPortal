export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/login' || to.path === '/') {
    return
  }

  const protectedPaths = ['/schedule', '/documents', '/feedback']
  const isVisitDetail = /^\/visits\/[^/]+$/.test(to.path)

  if (!protectedPaths.includes(to.path) && !isVisitDetail) {
    return
  }

  const token = useCookie<string | null>('carerpoint_family_portal_token')
  if (!token.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
