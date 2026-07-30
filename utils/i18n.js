const en = require('../locales/en')
const es = require('../locales/es')

const DICTIONARIES = {en, es}
const SUPPORTED_LOCALES = ['en', 'es']
const DEFAULT_LOCALE = 'en'

function resolveLocale(locale) {
    return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
}

function mapDiscordLocale(discordLocale) {
    if (!discordLocale) return DEFAULT_LOCALE
    const base = discordLocale.split('-')[0].toLowerCase()
    return resolveLocale(base)
}

function getPath(dict, key) {
    return key.split('.').reduce((value, part) => (value && typeof value === 'object' ? value[part] : undefined), dict)
}

function interpolate(template, params) {
    if (typeof template !== 'string') return template
    return template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
}

function t(locale, key, params = {}) {
    const resolved = resolveLocale(locale)
    const value = getPath(DICTIONARIES[resolved], key) ?? getPath(DICTIONARIES[DEFAULT_LOCALE], key) ?? key
    return interpolate(value, params)
}

module.exports = {t, resolveLocale, mapDiscordLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE}
