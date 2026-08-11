import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

/**
 * Ekran kengligi — React'dan tashqaridagi holat, shuning uchun
 * `useSyncExternalStore`. Effekt ichida `setState` chaqirilsa har o'lcham
 * o'zgarishida ortiqcha render zanjiri hosil bo'lardi.
 */
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

const getSnapshot = () => window.matchMedia(QUERY).matches

/** Serverda oyna yo'q — mobil emas deb hisoblanadi. */
const getServerSnapshot = () => false

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
