export default defineNuxtRouteMiddleware((to) => {
  // Public routes only: the landing page (which handles the invite token) and
  // the login page. Everything else requires a portal token — guard by a
  // public allowlist so new pages are protected by default (was: a stale
  // protected-paths allowlist that left /messages, /care-plan, /medications and
  // /calendar completely unguarded).
  if (to.path === '/' || to.path === '/login') {
    return
  }

  const token = useCookie<string | null>('carerpoint_family_portal_token')
  if (!token.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
