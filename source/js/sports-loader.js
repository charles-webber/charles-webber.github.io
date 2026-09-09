;(function () {
  function loadSportsWidget () {
    var root = document.getElementById('sports-root')
    if (!root) return

    if (!document.getElementById('sports-widget-style')) {
      var stylesheet = document.createElement('link')
      stylesheet.id = 'sports-widget-style'
      stylesheet.rel = 'stylesheet'
      stylesheet.href = '/css/sports.css?v=20260909'
      document.head.appendChild(stylesheet)
    }

    if (window.SportsWidget && typeof window.SportsWidget.mount === 'function') {
      window.SportsWidget.mount()
      return
    }

    var script = document.getElementById('sports-widget-script')
    if (!script) {
      script = document.createElement('script')
      script.id = 'sports-widget-script'
      script.src = '/js/sports.js?v=20260909'
      script.defer = true
      document.body.appendChild(script)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSportsWidget, { once: true })
  } else {
    loadSportsWidget()
  }
})()
