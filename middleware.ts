import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/sign-in(.*)', '/sign-up(.*)', '/api/setup'],
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|sw\\.js)).*)',
    '/(api|trpc)(.*)',
  ],
}
