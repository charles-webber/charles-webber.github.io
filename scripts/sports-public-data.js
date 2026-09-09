'use strict'

// Generate the small, explicitly allow-listed data file that the Sports page fetches.
// Raw imports and credentials remain outside source/ and never enter public/.
const fs = require('fs')
const path = require('path')

const number = value => Number.isFinite(Number(value)) ? Number(value) : 0
const text = value => typeof value === 'string' ? value : ''

function safeSummary (summary = {}) {
  return {
    activities: Math.max(0, Math.floor(number(summary.activities))),
    active_days: Math.max(0, Math.floor(number(summary.active_days))),
    duration_seconds: Math.max(0, Math.floor(number(summary.duration_seconds))),
    distance_km: Math.max(0, number(summary.distance_km))
  }
}

function safeSports (sports = {}) {
  const output = {}
  for (const type of ['run', 'cycling', 'swim', 'walk', 'hike', 'workout', 'other']) {
    output[type] = safeSummary({ ...sports[type], active_days: 0 })
    delete output[type].active_days
  }
  return output
}

function safeActivity (activity = {}) {
  return {
    date: text(activity.date).slice(0, 10),
    type: text(activity.type),
    distance_km: Math.max(0, number(activity.distance_km)),
    duration_seconds: Math.max(0, Math.floor(number(activity.duration_seconds)))
  }
}

function safeData (input = {}) {
  const years = {}
  for (const [year, value] of Object.entries(input.years || {})) {
    if (/^\d{4}$/.test(year)) {
      years[year] = { summary: safeSummary(value.summary), sports: safeSports(value.sports) }
    }
  }
  return {
    schema_version: 1,
    is_demo: Boolean(input.is_demo),
    updated_at: text(input.updated_at).slice(0, 10),
    current_year: text(input.current_year).slice(0, 4),
    available_years: Array.isArray(input.available_years) ? input.available_years.filter(year => /^\d{4}$/.test(String(year))).map(String) : [],
    summary: safeSummary(input.summary),
    sports: safeSports(input.sports),
    all_time_summary: safeSummary(input.all_time_summary),
    years,
    calendar: Array.isArray(input.calendar) ? input.calendar.map(day => ({
      ...safeActivity(day),
      activities: Math.max(0, Math.floor(number(day.activities))),
      sports: Array.isArray(day.sports) ? day.sports.map(sport => ({
        type: text(sport.type),
        activities: Math.max(0, Math.floor(number(sport.activities))),
        distance_km: Math.max(0, number(sport.distance_km)),
        duration_seconds: Math.max(0, Math.floor(number(sport.duration_seconds)))
      })) : []
    })) : [],
    monthly: Array.isArray(input.monthly) ? input.monthly.map(month => ({
      month: text(month.month).slice(0, 7), ...safeSummary(month)
    })) : [],
    recent: Array.isArray(input.recent) ? input.recent.map(safeActivity) : [],
    records: Array.isArray(input.records) ? input.records.map(record => ({
      label: text(record.label), type: text(record.type), date: text(record.date).slice(0, 10), month: text(record.month).slice(0, 7), distance_km: Math.max(0, number(record.distance_km))
    })) : []
  }
}

hexo.extend.filter.register('after_generate', function () {
  const data = hexo.locals.get('data').sports
  if (!data) return
  const output = path.join(hexo.public_dir, 'sports.json')
  fs.mkdirSync(hexo.public_dir, { recursive: true })
  fs.writeFileSync(output, JSON.stringify(safeData(data), null, 2) + '\n')
})
