;(function () {
  'use strict'

  var TYPES = {
    run: { label: 'Running', icon: '🏃' },
    cycling: { label: 'Cycling', icon: '🚴' },
    swim: { label: 'Swimming', icon: '🏊' },
    walk: { label: 'Walking', icon: '🚶' },
    hike: { label: 'Hiking', icon: '🥾' },
    workout: { label: 'Workout', icon: '🏋️' },
    other: { label: 'Other', icon: '✦' }
  }

  function escapeHtml (value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (character) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]
    })
  }

  function number (value) {
    var result = Number(value)
    return Number.isFinite(result) ? result : 0
  }

  function typeInfo (type) {
    return TYPES[type] || TYPES.other
  }

  function formatKm (value) {
    var km = number(value)
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: km >= 100 ? 0 : 1 }).format(km) + ' km'
  }

  function formatDuration (value) {
    var seconds = Math.max(0, Math.round(number(value)))
    var hours = Math.floor(seconds / 3600)
    var minutes = Math.round((seconds % 3600) / 60)
    if (hours) return hours + ' h' + (minutes ? ' ' + minutes + ' min' : '')
    return minutes + ' min'
  }

  function formatDate (date) {
    var parsed = new Date(date + 'T00:00:00')
    return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(parsed)
  }

  function formatPaceOrSpeed (activity) {
    var distance = number(activity.distance_km)
    var seconds = number(activity.duration_seconds)
    if (!distance || !seconds) return ''
    if (activity.type === 'run' || activity.type === 'walk' || activity.type === 'hike') {
      var pace = Math.round(seconds / distance)
      return Math.floor(pace / 60) + "'" + String(pace % 60).padStart(2, '0') + '"/km'
    }
    if (activity.type === 'cycling') return (distance / (seconds / 3600)).toFixed(1) + ' km/h'
    if (activity.type === 'swim') {
      var per100 = Math.round(seconds / (distance * 10))
      return Math.floor(per100 / 60) + "'" + String(per100 % 60).padStart(2, '0') + '"/100m'
    }
    return ''
  }

  function getYearData (data, year) {
    return (data.years && data.years[year]) || { summary: data.summary || {}, sports: data.sports || {} }
  }

  function aggregateDays (days) {
    return days.reduce(function (result, day) {
      result.activities += number(day.activities)
      result.distance_km += number(day.distance_km)
      result.duration_seconds += number(day.duration_seconds)
      return result
    }, { activities: 0, distance_km: 0, duration_seconds: 0 })
  }

  function currentPeriodStats (data) {
    var today = new Date()
    var todayKey = today.toISOString().slice(0, 10)
    var monday = new Date(today)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    var mondayKey = monday.toISOString().slice(0, 10)
    var monthKey = todayKey.slice(0, 7)
    var days = Array.isArray(data.calendar) ? data.calendar : []
    return {
      week: aggregateDays(days.filter(function (day) { return day.date >= mondayKey && day.date <= todayKey })),
      month: aggregateDays(days.filter(function (day) { return day.date.indexOf(monthKey) === 0 })),
      year: aggregateDays(days.filter(function (day) { return day.date.indexOf(todayKey.slice(0, 4)) === 0 }))
    }
  }

  function miniPeriod (label, value) {
    return '<div class="sports-period"><span>' + label + '</span><strong>' + value.activities + '</strong><small>' + formatKm(value.distance_km) + '</small></div>'
  }

  function overviewMarkup (yearData, periods, year, isDemo) {
    var sports = yearData.sports || {}
    var summary = yearData.summary || {}
    var cards = [
      ['run', sports.run || {}], ['cycling', sports.cycling || {}], ['swim', sports.swim || {}]
    ].map(function (entry) {
      var info = typeInfo(entry[0])
      return '<article class="sports-stat-card"><span class="sports-stat-card__icon">' + info.icon + '</span><div><strong>' + formatKm(entry[1].distance_km) + '</strong><span>' + info.label + '</span></div></article>'
    }).join('')
    cards += '<article class="sports-stat-card"><span class="sports-stat-card__icon">🗓️</span><div><strong>' + number(summary.active_days) + '</strong><span>Active Days</span></div></article>'
    cards += '<article class="sports-stat-card"><span class="sports-stat-card__icon">⏱️</span><div><strong>' + formatDuration(summary.duration_seconds) + '</strong><span>Total Time</span></div></article>'
    return '<header class="sports-hero"><div><p class="sports-eyebrow">Sports / Activity</p><h2>This Year <span>' + escapeHtml(year) + '</span></h2><p class="sports-subtitle">A quiet record of miles, movement and consistency.</p></div>' + (isDemo ? '<span class="sports-demo-badge">DEMO DATA</span>' : '') + '</header><section class="sports-overview" aria-label="Annual activity overview">' + cards + '</section><section class="sports-periods" aria-label="Current activity periods">' + miniPeriod('This week', periods.week) + miniPeriod('This month', periods.month) + miniPeriod('This year', periods.year) + '</section>'
  }

  function calendarTooltip (day) {
    if (!day) return ''
    var details = (day.sports || []).map(function (sport) {
      var info = typeInfo(sport.type)
      return info.label + ' · ' + formatKm(sport.distance_km) + ' · ' + formatDuration(sport.duration_seconds)
    })
    return [day.date].concat(details).join('\n')
  }

  function calendarMarkup (data, year) {
    var yearDays = (data.calendar || []).filter(function (day) { return String(day.date).indexOf(year + '-') === 0 })
    var byDate = {}
    yearDays.forEach(function (day) { byDate[day.date] = day })
    var start = new Date(Date.UTC(Number(year), 0, 1))
    var end = new Date(Date.UTC(Number(year), 11, 31))
    var cells = []
    for (var leading = 0; leading < start.getUTCDay(); leading++) cells.push('<span class="sports-heatmap__cell sports-heatmap__cell--empty" aria-hidden="true"></span>')
    for (var cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      var key = cursor.toISOString().slice(0, 10)
      var day = byDate[key]
      var minutes = day ? number(day.duration_seconds) / 60 : 0
      var intensity = minutes === 0 ? 0 : minutes < 30 ? 1 : minutes < 60 ? 2 : minutes < 120 ? 3 : 4
      cells.push('<span class="sports-heatmap__cell level-' + intensity + '" title="' + escapeHtml(calendarTooltip(day) || key + ': no activity') + '" aria-label="' + escapeHtml(calendarTooltip(day) || key + ': no activity') + '"></span>')
    }
    while (cells.length % 7) cells.push('<span class="sports-heatmap__cell sports-heatmap__cell--empty" aria-hidden="true"></span>')
    return '<section class="sports-panel sports-calendar"><div class="sports-panel__heading"><div><p class="sports-kicker">Consistency</p><h3>Activity calendar</h3></div><div class="sports-legend" aria-label="Activity duration intensity"><span>Less</span><i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i><span>More</span></div></div><div class="sports-heatmap-scroll"><div class="sports-heatmap" role="img" aria-label="' + escapeHtml(year) + ' activity heatmap">' + cells.join('') + '</div></div></section>'
  }

  function trendMarkup (data, year) {
    var byMonth = {}
    ;(data.monthly || []).filter(function (month) { return String(month.month).indexOf(year + '-') === 0 }).forEach(function (month) { byMonth[month.month] = number(month.distance_km) })
    var values = []
    for (var month = 1; month <= 12; month++) values.push(byMonth[year + '-' + String(month).padStart(2, '0')] || 0)
    var maximum = Math.max.apply(Math, values.concat([1]))
    var points = values.map(function (value, index) { return (index * (600 / 11)).toFixed(1) + ',' + (154 - (value / maximum) * 126).toFixed(1) }).join(' ')
    var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(function (label) { return '<span>' + label + '</span>' }).join('')
    return '<section class="sports-panel sports-trend"><div class="sports-panel__heading"><div><p class="sports-kicker">Distance / Month</p><h3>Monthly distance</h3></div><strong>' + formatKm(values.reduce(function (sum, value) { return sum + value }, 0)) + '</strong></div><div class="sports-trend__chart"><svg viewBox="0 0 600 180" preserveAspectRatio="none" role="img" aria-label="Monthly distance trend"><defs><linearGradient id="sports-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--sports-accent)" stop-opacity=".36"/><stop offset="100%" stop-color="var(--sports-accent)" stop-opacity="0"/></linearGradient></defs><path class="sports-trend__grid" d="M0 28H600M0 91H600M0 154H600"></path><polygon class="sports-trend__area" points="0,154 ' + points + ' 600,154"></polygon><polyline class="sports-trend__line" points="' + points + '"></polyline></svg></div><div class="sports-trend__labels">' + labels + '</div></section>'
  }

  function breakdownMarkup (yearData) {
    var sports = yearData.sports || {}
    var entries = Object.keys(TYPES).map(function (type) {
      return { type: type, value: number((sports[type] || {}).duration_seconds), distance: number((sports[type] || {}).distance_km) }
    }).filter(function (entry) { return entry.value > 0 || entry.distance > 0 }).sort(function (a, b) { return b.value - a.value })
    var total = entries.reduce(function (sum, entry) { return sum + entry.value }, 0) || 1
    var rows = entries.length ? entries.map(function (entry) {
      var info = typeInfo(entry.type)
      var percentage = Math.round(entry.value / total * 100)
      return '<div class="sports-breakdown__row"><span>' + info.icon + ' ' + info.label + '</span><div class="sports-breakdown__bar"><i style="width:' + percentage + '%"></i></div><strong>' + percentage + '%</strong></div>'
    }).join('') : '<p class="sports-empty">No activity for this year yet.</p>'
    return '<section class="sports-panel sports-breakdown"><div class="sports-panel__heading"><div><p class="sports-kicker">By activity time</p><h3>Sports breakdown</h3></div></div>' + rows + '</section>'
  }

  function recentMarkup (data, year) {
    var recent = (data.recent || []).filter(function (activity) { return String(activity.date).indexOf(year + '-') === 0 })
    if (!recent.length) recent = data.recent || []
    var rows = recent.slice(0, 8).map(function (activity) {
      var info = typeInfo(activity.type)
      var metric = formatPaceOrSpeed(activity)
      return '<li><time>' + escapeHtml(formatDate(activity.date)) + '</time><span class="sports-recent__icon">' + info.icon + '</span><div><strong>' + info.label + '</strong><small>' + formatKm(activity.distance_km) + ' · ' + formatDuration(activity.duration_seconds) + (metric ? ' · ' + metric : '') + '</small></div></li>'
    }).join('')
    return '<section class="sports-panel sports-recent"><div class="sports-panel__heading"><div><p class="sports-kicker">Latest sessions</p><h3>Recent activities</h3></div></div><ol>' + (rows || '<li class="sports-empty">No activities recorded.</li>') + '</ol></section>'
  }

  function recordsMarkup (data) {
    var records = data.records || []
    if (!records.length) return ''
    var rows = records.map(function (record) {
      var info = typeInfo(record.type)
      return '<div class="sports-record"><span>' + info.icon + '</span><div><small>' + escapeHtml(record.label) + '</small><strong>' + formatKm(record.distance_km) + '</strong><em>' + escapeHtml(record.month || record.date || '') + '</em></div></div>'
    }).join('')
    return '<section class="sports-panel sports-records"><div class="sports-panel__heading"><div><p class="sports-kicker">Automatic</p><h3>Personal records</h3></div></div><div class="sports-records__grid">' + rows + '</div></section>'
  }

  function dashboardMarkup (data, year) {
    var yearData = getYearData(data, year)
    var yearOptions = (data.available_years || []).map(function (option) { return '<option value="' + escapeHtml(option) + '"' + (option === year ? ' selected' : '') + '>' + escapeHtml(option) + '</option>' }).join('')
    var periods = currentPeriodStats(data)
    return '<div class="sports-dashboard">' + overviewMarkup(yearData, periods, year, data.is_demo) + '<div class="sports-year-picker"><label for="sports-year">Year</label><select id="sports-year" aria-label="Select statistics year">' + yearOptions + '</select></div>' + calendarMarkup(data, year) + '<div class="sports-grid sports-grid--two">' + trendMarkup(data, year) + breakdownMarkup(yearData) + '</div><div class="sports-grid sports-grid--two">' + recentMarkup(data, year) + recordsMarkup(data) + '</div>' + (data.is_demo ? '<p class="sports-demo-note">This page currently uses a small DEMO data set. Replace it with an import or Strava sync before treating these figures as real.</p>' : '') + '</div>'
  }

  function renderError (root) {
    root.innerHTML = '<div class="sports-error"><strong>Activity data is unavailable.</strong><span>Run <code>npm run sports:update</code> and build the site again.</span></div>'
  }

  function mount () {
    var root = document.getElementById('sports-root')
    if (!root || root.dataset.loading === 'true') return
    root.dataset.loading = 'true'
    root.setAttribute('aria-busy', 'true')
    fetch(root.getAttribute('data-sports-url') || '/sports.json', { cache: 'no-store' })
      .then(function (response) { if (!response.ok) throw new Error('Sports JSON not found'); return response.json() })
      .then(function (data) {
        var year = String(data.current_year || (data.available_years || []).slice(-1)[0] || new Date().getFullYear())
        root.innerHTML = dashboardMarkup(data, year)
        root.removeAttribute('data-loading')
        root.setAttribute('aria-busy', 'false')
        var selector = root.querySelector('#sports-year')
        if (selector) selector.addEventListener('change', function () { root.innerHTML = dashboardMarkup(data, selector.value); bindYearSelector(root, data) })
      })
      .catch(function () { renderError(root); root.setAttribute('aria-busy', 'false') })
  }

  function bindYearSelector (root, data) {
    var selector = root.querySelector('#sports-year')
    if (selector) selector.addEventListener('change', function () { root.innerHTML = dashboardMarkup(data, selector.value); bindYearSelector(root, data) })
  }

  window.SportsWidget = { mount: mount }
  mount()
})()
