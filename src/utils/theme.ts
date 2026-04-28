export const THEME_STORAGE_KEY = 'memo-app-theme'

export type ThemePreference = 'light' | 'dark'

/** 인라인 스크립트용: layout에서만 사용 */
export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var v=localStorage.getItem(k);var d=v==='dark'||(v!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`
