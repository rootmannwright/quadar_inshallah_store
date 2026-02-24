import Cookies from "cookies"

export function cookieMiddleware(req, res, next) {
  const keys = [process.env.COOKIE_SECRET]
  req.cookies = new Cookies(req, res, { keys })
  next()
}