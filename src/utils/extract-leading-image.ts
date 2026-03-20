interface ExtractLeadingImageResult {
  imageUrl: string | undefined
  html: string
}

/**
 * Extracts a leading <img> tag from the beginning of HTML content.
 * Only extracts images that appear as the first meaningful element
 * (optionally wrapped in whitespace or a <p> tag).
 * Returns the image URL and the HTML with the leading image removed.
 */
export function extractLeadingImage(html: string): ExtractLeadingImageResult {
  if (!html) {
    return { imageUrl: undefined, html }
  }

  const document_ = new DOMParser().parseFromString(html, "text/html")
  const body = document_.body

  const firstImg = findLeadingImg(body)
  if (!firstImg) {
    return { imageUrl: undefined, html }
  }

  const imageSource = firstImg.getAttribute("src")
  if (!imageSource) {
    return { imageUrl: undefined, html }
  }

  // Remove the img, its <a> wrapper, and/or its <p> wrapper if they become empty
  const imgParent = firstImg.parentElement
  const removeTarget =
      imgParent?.tagName === "A" ? imgParent : firstImg
  const wrapperParent = removeTarget.parentElement
  if (
    wrapperParent?.tagName === "P" &&
    wrapperParent.children.length === 1 &&
    !wrapperParent.textContent?.trim()
  ) {
    wrapperParent.remove()
  } else {
    removeTarget.remove()
  }

  return { imageUrl: imageSource, html: body.innerHTML }
}

function findLeadingImg(body: HTMLElement): HTMLImageElement | undefined {
  for (const node of body.childNodes) {
    // Skip whitespace text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.trim()) {
        // Non-whitespace text before any element — no leading image
        return undefined
      }
      continue
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement

      if (element.tagName === "IMG") {
        return element as HTMLImageElement
      }

      // Check if it's an <a> wrapping an <img>
      if (element.tagName === "A") {
        const img = findImgInAnchor(element)
        if (img) {
          return img
        }
        return undefined
      }

      // Check if it's a <p> wrapping an <img> (or <a><img>) as its first meaningful child
      if (element.tagName === "P") {
        for (const child of element.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            if (child.textContent?.trim()) {
              return undefined
            }
            continue
          }
          if (child.nodeType === Node.ELEMENT_NODE) {
            const childElement = child as HTMLElement
            if (childElement.tagName === "IMG") {
              return childElement as HTMLImageElement
            }
            if (childElement.tagName === "A") {
              const img = findImgInAnchor(childElement)
              if (img) {
                return img
              }
            }
          }
          return undefined
        }
      }

      // Any other element before an img means no leading image
      return undefined
    }
  }

  return undefined
}

function findImgInAnchor(
  anchor: HTMLElement,
): HTMLImageElement | undefined {
  for (const child of anchor.childNodes) {
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      (child as HTMLElement).tagName === "IMG"
    ) {
      return child as HTMLImageElement
    }
  }
  return undefined
}
