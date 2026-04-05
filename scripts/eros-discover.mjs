#!/usr/bin/env node
/**
 * eros-discover.mjs — Eros discovers references from Awwwards
 *
 * Scrapes Awwwards Sites of the Day, extracts real URLs,
 * and feeds them to eros-train study for autonomous learning.
 *
 * Usage:
 *   node eros-discover.mjs                    # discover + list 10 recent winners
 *   node eros-discover.mjs --study            # discover + study top 3 automatically
 *   node eros-discover.mjs --study --count 5  # study top 5
 *   node eros-discover.mjs --list             # just list, don't study
 */

import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { parseArgs, readJson, writeJson, out, fail, today } from './eros-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..')
const discoveryFile = path.join(maquetaDir, '.claude', 'memory', 'design-intelligence', 'discovered-references.json')

const log = (msg) => process.stderr.write(`[eros-discover] ${msg}\n`)

const callScript = (script, args, timeoutMs = 300000) => new Promise((resolve, reject) => {
  const p = path.join(__dirname, script)
  execFile('node', [p, ...args], { cwd: __dirname, timeout: timeoutMs }, (err, stdout) => {
    if (err) { reject(err); return }
    try { resolve(JSON.parse(stdout)) } catch { resolve({ raw: stdout }) }
  })
})

// ---------------------------------------------------------------------------
// Scrape Awwwards SOTD
// ---------------------------------------------------------------------------

const scrapeAwwwards = async (maxItems = 10) => {
  log('Connecting to Awwwards...')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto('https://www.awwwards.com/websites/sites_of_the_day/', {
      waitUntil: 'networkidle', timeout: 30000,
    })
    await new Promise(r => setTimeout(r, 3000))

    // Extract SOTD entries
    const entries = await page.evaluate((max) => {
      const items = document.querySelectorAll('li.js-collectable')
      return [...items].slice(0, max).map(li => {
        const link = li.querySelector('a[href*="/sites/"]')
        const title = li.querySelector('.heading-4, h2, h3')?.textContent?.trim()
        return {
          title: title || null,
          awwwardsUrl: link?.href || null,
          slug: link?.href?.split('/sites/')?.[1]?.replace(/\/$/, '') || null,
        }
      }).filter(s => s.awwwardsUrl)
    }, maxItems)

    log(`Found ${entries.length} SOTD entries`)

    // Extract real site URLs from each detail page
    const sites = []
    for (const entry of entries) {
      try {
        await page.goto(entry.awwwardsUrl, { waitUntil: 'networkidle', timeout: 20000 })
        await new Promise(r => setTimeout(r, 1500))

        const siteData = await page.evaluate(() => {
          // Find the visit link — toolbar button or first external link
          const socialDomains = ['youtube', 'facebook', 'twitter', 'instagram', 'linkedin', 'pinterest', 'dribbble', 'behance', 'github', 'vimeo', 'tiktok']
          const allLinks = [...document.querySelectorAll('a')]
            .map(a => a.href)
            .filter(h => h && h.startsWith('http') && !h.includes('awwwards.com') && !socialDomains.some(d => h.includes(d)))

          // Deduplicate and pick the most common external domain
          const domainCount = {}
          for (const url of allLinks) {
            try {
              const domain = new URL(url).hostname
              domainCount[domain] = (domainCount[domain] || 0) + 1
            } catch {}
          }
          const topDomain = Object.entries(domainCount).sort((a, b) => b[1] - a[1])[0]
          const siteUrl = topDomain ? allLinks.find(u => u.includes(topDomain[0])) : null

          // Extract tags/categories
          const tags = [...document.querySelectorAll('[class*="category"], [class*="tag-"]')]
            .map(t => t.textContent?.trim())
            .filter(t => t && t.length > 2 && t.length < 30)
            .slice(0, 5)

          return { siteUrl, tags }
        })

        if (siteData.siteUrl) {
          sites.push({
            title: entry.title || entry.slug,
            slug: entry.slug,
            awwwardsUrl: entry.awwwardsUrl,
            siteUrl: siteData.siteUrl,
            tags: siteData.tags,
            discoveredAt: new Date().toISOString(),
          })
          log(`  ${entry.slug} → ${siteData.siteUrl}`)
        }
      } catch {
        log(`  ${entry.slug} → failed to extract URL`)
      }
    }

    return sites
  } finally {
    await browser.close()
  }
}

// ---------------------------------------------------------------------------
// Study a discovered site
// ---------------------------------------------------------------------------

const studySite = async (site) => {
  log(`Studying ${site.title} (${site.siteUrl})...`)
  try {
    const result = await callScript('eros-train.mjs', ['study', '--url', site.siteUrl], 300000)
    return { ...site, studied: true, result }
  } catch (err) {
    log(`  Failed: ${err.message}`)
    return { ...site, studied: false, error: err.message }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const doStudy = args.study === true
  const listOnly = args.list === true
  const count = parseInt(args.count || '3')

  log('')
  log('═══════════════════════════════════════════')
  log(' EROS REFERENCE DISCOVERY')
  log(` Source: Awwwards Sites of the Day`)
  log(doStudy ? ` Mode: Study top ${count}` : ' Mode: List only')
  log('═══════════════════════════════════════════')
  log('')

  // Load previous discoveries
  const history = (await readJson(discoveryFile)) || { sites: [], lastScan: null }
  const knownUrls = new Set(history.sites.map(s => s.siteUrl))

  // Scrape Awwwards
  const discovered = await scrapeAwwwards(doStudy ? count + 5 : 10)

  // Filter out already known
  const newSites = discovered.filter(s => !knownUrls.has(s.siteUrl))
  log(`${newSites.length} new sites (${discovered.length - newSites.length} already known)`)

  // Save all discoveries
  for (const site of newSites) {
    history.sites.push(site)
  }
  history.lastScan = new Date().toISOString()
  await writeJson(discoveryFile, history)

  if (listOnly || !doStudy) {
    out({
      discovered: newSites.length,
      sites: newSites.map(s => ({ title: s.title, url: s.siteUrl, tags: s.tags })),
      totalKnown: history.sites.length,
    })
    return
  }

  // Study top N new sites
  const toStudy = newSites.slice(0, count)
  log('')
  log(`Studying ${toStudy.length} new references...`)
  log('')

  const results = []
  for (const site of toStudy) {
    const result = await studySite(site)
    results.push(result)
    log('')
  }

  // Update memory stats
  let stats = null
  try { stats = await callScript('eros-memory.mjs', ['stats']) } catch {}

  log('═══════════════════════════════════════════')
  log(' DISCOVERY COMPLETE')
  log(` Studied: ${results.filter(r => r.studied).length}/${results.length}`)
  log(` Memory: ${stats?.totalDataPoints || '?'} data points`)
  log('═══════════════════════════════════════════')

  out({
    discovered: newSites.length,
    studied: results.filter(r => r.studied).length,
    failed: results.filter(r => !r.studied).length,
    sites: results.map(r => ({
      title: r.title,
      url: r.siteUrl,
      studied: r.studied,
    })),
    memoryAfter: stats?.totalDataPoints || 0,
  })
}

main().catch(err => { log(`Fatal: ${err.message}`); process.exit(1) })
