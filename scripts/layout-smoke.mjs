import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'

async function checkPage(page, path, label) {
  const issues = []
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('.react-grid-item, .widget-shell-group', { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(2000)

  const gridItems = page.locator('.react-grid-item')
  const count = await gridItems.count()
  if (count === 0) {
    issues.push('No .react-grid-item elements found — grid may not have mounted')
    return { label, count, issues }
  }

  const first = gridItems.first()
  const box = await first.boundingBox()
  if (!box || box.width < 50 || box.height < 50) {
    issues.push(`First grid item too small: ${JSON.stringify(box)}`)
  }

  const handles = page.locator('.react-resizable-handle')
  const handleCount = await handles.count()
  if (handleCount === 0) {
    issues.push('No resize handles in DOM')
  }

  const dragHandles = page.locator('.drag-handle')
  const dragCount = await dragHandles.count()

  // Drag: hub requires .drag-handle; main allows whole card
  const dragTarget = page.locator('.widget-drag-bar').first()
  const dragBox = await dragTarget.boundingBox()
  if (dragBox) {
    const startX = dragBox.x + dragBox.width / 2
    const startY = dragBox.y + dragBox.height / 2
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 100, startY + 60, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(600)
  } else {
    issues.push('Could not find drag target for interaction test')
  }

  // Resize via SE handle
  const seHandle = page.locator('.react-resizable-handle-se').first()
  const seBox = await seHandle.boundingBox()
  if (seBox) {
    await page.mouse.move(seBox.x + seBox.width / 2, seBox.y + seBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(seBox.x + 40, seBox.y + 40, { steps: 6 })
    await page.mouse.up()
    await page.waitForTimeout(600)
  }

  const storageKey =
    path.includes('hub') ? 'adversity-hub-layout-v2' : 'adversity-main-layout-v2'
  const saved = await page.evaluate((key) => localStorage.getItem(key), storageKey)
  if (!saved) {
    issues.push(`localStorage "${storageKey}" empty after drag — persistence may not work`)
  } else {
    try {
      const parsed = JSON.parse(saved)
      if (!parsed.lg?.length) issues.push('Saved layout missing lg breakpoint')
    } catch {
      issues.push('Saved layout is not valid JSON')
    }
  }

  const overflow = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.react-grid-item')]
    return items.filter((el) => {
      const child = el.firstElementChild
      if (!child) return false
      return child.scrollHeight > child.clientHeight + 2 && child.clientHeight < 40
    }).length
  })

  if (overflow > 2) {
    issues.push(`${overflow} grid items may have clipped content (very short cells)`)
  }

  // Reload and confirm layout persisted
  const savedBefore = saved
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const savedAfter = await page.evaluate((key) => localStorage.getItem(key), storageKey)
  if (!savedAfter) {
    issues.push('Layout missing from localStorage after page reload')
  } else if (savedBefore && savedAfter !== savedBefore) {
    issues.push('Layout changed unexpectedly after reload (before drag save?)')
  }

  const fillCheck = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.react-grid-item')]
    let missingFullHeight = 0
    for (const item of items.slice(0, 5)) {
      const child = item.firstElementChild
      if (!child) continue
      const itemH = item.getBoundingClientRect().height
      const childH = child.getBoundingClientRect().height
      if (itemH > 80 && childH < itemH * 0.85) missingFullHeight++
    }
    return missingFullHeight
  })
  if (fillCheck > 2) {
    issues.push(`${fillCheck} widgets do not fill grid cell height (visual gap)`)
  }

  return { label, count, handleCount, dragCount, issues, saved: !!saved }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  const results = []
  for (const [path, label] of [
    ['/main', 'MAIN'],
    ['/hub', 'HUB'],
  ]) {
    try {
      results.push(await checkPage(page, path, label))
    } catch (e) {
      results.push({ label, issues: [String(e.message ?? e)] })
    }
  }

  await browser.close()
  console.log(JSON.stringify(results, null, 2))
  const failed = results.some((r) => r.issues?.length)
  process.exit(failed ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
