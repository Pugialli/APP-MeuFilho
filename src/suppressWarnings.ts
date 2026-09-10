// Suprime warnings de migração do React Native Web que não temos como corrigir
// na fonte (shadow* vem dos nossos estilos nativos; pointerEvents vem do React Navigation).
// Este módulo não tem imports — é executado antes de qualquer StyleSheet.create.
const _warn = console.warn.bind(console)
console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && (
    args[0].includes('style props are deprecated') ||
    args[0].includes('pointerEvents is deprecated')
  )) return
  _warn(...args)
}
