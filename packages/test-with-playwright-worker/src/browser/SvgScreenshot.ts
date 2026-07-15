import { elementToSVG } from 'dom-to-svg'

const hiddenSelectors = ['#TestOverlay', '.TestResults']
const externalResourceRegex = /\b(?:href|src)=["']https?:|url\(["']?https?:/i
const externalUrlRegex = /url\((["']?)(https?:[^)"']+)\1\)/gi
const fontFaceRegex = /@font-face\s*{[^}]*}/gi
const fontFamilyRegex = /font-family\s*:\s*(?:"([^"]+)"|'([^']+)'|([^;]+))/i
const fontQuoteRegex = /^['"]|['"]$/g
const xlinkNamespace = 'http://www.w3.org/1999/xlink'

interface DetachedElement {
  readonly element: HTMLElement
  readonly nextSibling: ChildNode | null
  readonly parent: ParentNode
}

const detachTestUi = (): readonly DetachedElement[] => {
  const elements = new Set<HTMLElement>()
  for (const selector of hiddenSelectors) {
    for (const element of document.querySelectorAll<HTMLElement>(selector)) {
      elements.add(element)
    }
  }
  const detached: DetachedElement[] = []
  for (const element of elements) {
    if (!element.parentNode) {
      continue
    }
    detached.push({ element, nextSibling: element.nextSibling, parent: element.parentNode })
    element.remove()
  }
  return detached
}

const restoreTestUi = (detached: readonly DetachedElement[]): void => {
  for (const { element, nextSibling, parent } of detached) {
    if (nextSibling) {
      nextSibling.before(element)
    } else {
      parent.append(element)
    }
  }
}

const normalizeFontFamily = (fontFamily: string): string => {
  return fontFamily.trim().replaceAll(fontQuoteRegex, '').toLowerCase()
}

const removeUnusedFonts = (svg: SVGSVGElement): void => {
  const usedFonts = new Set<string>()
  for (const element of svg.querySelectorAll('[font-family]')) {
    const fontFamily = element.getAttribute('font-family') || ''
    for (const family of fontFamily.split(',')) {
      usedFonts.add(normalizeFontFamily(family))
    }
  }
  for (const style of svg.querySelectorAll('style')) {
    const fontFaces = Array.from((style.textContent || '').matchAll(fontFaceRegex), (match) => match[0])
    const usedFontFaces = fontFaces.filter((fontFace) => {
      const match = fontFace.match(fontFamilyRegex)
      const family = match?.[1] || match?.[2] || match?.[3] || ''
      return usedFonts.has(normalizeFontFamily(family))
    })
    if (usedFontFaces.length === 0) {
      style.remove()
    } else {
      style.textContent = usedFontFaces.join('\n')
    }
  }
}

const removeNonDeterministicMetadata = (svg: SVGSVGElement): void => {
  const walker = svg.ownerDocument.createTreeWalker(svg, NodeFilter.SHOW_COMMENT)
  const comments: Comment[] = []
  while (walker.nextNode()) {
    comments.push(walker.currentNode as Comment)
  }
  for (const comment of comments) {
    comment.remove()
  }
  for (const element of svg.querySelectorAll<SVGElement>('[data-src]')) {
    delete element.dataset.src
  }
  for (const element of svg.querySelectorAll('[aria-owns]')) {
    const ownedIds = (element.getAttribute('aria-owns') || '').split(' ')
    const existingIds = ownedIds.filter((id) => id && svg.querySelector(`#${CSS.escape(id)}`))
    if (existingIds.length === 0) {
      element.toggleAttribute('aria-owns', false)
    } else {
      element.setAttribute('aria-owns', existingIds.join(' '))
    }
  }
}

const fetchDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to inline SVG screenshot resource: ${response.status} ${url}`)
  }
  const blob = await response.blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('error', () => reject(new Error(`Failed to read SVG screenshot resource: ${url}`)))
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new TypeError(`Expected a data URL for SVG screenshot resource: ${url}`))
      }
    })
    reader.readAsDataURL(blob)
  })
}

const inlineElementResource = async (element: Element): Promise<void> => {
  const href =
    element.getAttribute('href') || element.getAttribute('xlink:href') || element.getAttributeNS(xlinkNamespace, 'href')
  if (href?.startsWith('http')) {
    const dataUrl = await fetchDataUrl(href)
    if (element.hasAttribute('href')) {
      element.setAttribute('href', dataUrl)
    }
    if (element.hasAttribute('xlink:href')) {
      element.setAttribute('xlink:href', dataUrl)
    }
    if (element.hasAttributeNS(xlinkNamespace, 'href')) {
      element.setAttributeNS(xlinkNamespace, 'xlink:href', dataUrl)
    }
  }
  const source = element.getAttribute('src')
  if (source?.startsWith('http')) {
    element.setAttribute('src', await fetchDataUrl(source))
  }
}

const inlineStyleResources = async (style: Element): Promise<void> => {
  let content = style.textContent || ''
  const urls = Array.from(content.matchAll(externalUrlRegex), (match) => match[2]).filter((url): url is string =>
    Boolean(url),
  )
  const uniqueUrls = new Set(urls)
  for (const url of uniqueUrls) {
    const dataUrl = await fetchDataUrl(url)
    content = content.replaceAll(url, () => dataUrl)
  }
  style.textContent = content
}

const inlineSvgResources = async (svg: SVGSVGElement): Promise<void> => {
  const elements = [svg, ...svg.querySelectorAll('*')]
  await Promise.all(elements.map(inlineElementResource))
  await Promise.all(Array.from(svg.querySelectorAll('style'), inlineStyleResources))
}

export const capture = async (selector?: string): Promise<string> => {
  await document.fonts.ready
  const detached = detachTestUi()
  const freezeStyle = document.createElement('style')
  freezeStyle.textContent = `*, *::before, *::after {
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    caret-color: transparent !important;
    transition-delay: 0s !important;
    transition-duration: 0s !important;
  }`
  document.head.append(freezeStyle)
  try {
    const target = selector ? document.querySelector(selector) : document.body
    if (!target) {
      throw new Error(`SVG screenshot selector did not match an element: ${selector}`)
    }
    const root = document.documentElement
    const captureArea = selector
      ? target.getBoundingClientRect()
      : new DOMRect(0, 0, root.clientWidth, root.clientHeight)
    const svgDocument = elementToSVG(target, {
      captureArea,
      keepLinks: false,
    })
    const svg = svgDocument.documentElement as unknown as SVGSVGElement
    removeUnusedFonts(svg)
    await inlineSvgResources(svg)
    removeNonDeterministicMetadata(svg)
    const serialized = new XMLSerializer().serializeToString(svg)
    const externalResourceIndex = serialized.search(externalResourceRegex)
    if (externalResourceIndex !== -1) {
      const context = serialized.slice(externalResourceIndex, externalResourceIndex + 160)
      throw new Error(`SVG screenshot contains an external resource: ${context}`)
    }
    return serialized
  } finally {
    freezeStyle.remove()
    restoreTestUi(detached)
  }
}
