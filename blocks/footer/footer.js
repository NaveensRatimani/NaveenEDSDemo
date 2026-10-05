/**
 * Fetches the footer fragment. Tries the local preview location first, then the
 * site root (DA/EDS). Relative image paths are resolved against the fragment URL
 * so they work on every page depth.
 * @returns {Promise<Element|null>} body of the parsed fragment
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const base = new URL(resp.url, window.location.href);
  const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  return doc.body;
}

/**
 * Normalizes a path for comparison: drops the local /content prefix,
 * a trailing .html and a trailing slash.
 * @param {string} path
 * @returns {string}
 */
function normalizePath(path) {
  const p = path.replace(/^\/content(?=\/)/, '').replace(/\.html$/, '').replace(/\/$/, '');
  return p || '/';
}

function linkPath(a) {
  try {
    return normalizePath(new URL(a.href, window.location.href).pathname);
  } catch (e) {
    return '';
  }
}

/**
 * Marks the link list: the home link (same target as the brand link) is flagged
 * so it can stay hidden, and the link for the current section gets aria-current.
 * @param {Element} list
 * @param {string} homePath
 */
function decorateLinks(list, homePath) {
  const path = normalizePath(window.location.pathname);
  list.querySelectorAll('li > a').forEach((a) => {
    const target = linkPath(a);
    const isHome = target === homePath;
    if (isHome) a.classList.add('footer-home');
    const current = isHome ? path === target : (path === target || path.startsWith(`${target}/`));
    if (current) a.setAttribute('aria-current', 'page');
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const [brandSection, navSection, socialSection, legalSection] = [...fragment.querySelectorAll(':scope > div')];

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  const top = document.createElement('div');
  top.className = 'footer-top';

  let homePath = '/';
  if (brandSection) {
    brandSection.className = 'footer-brand';
    const brandLink = brandSection.querySelector('a');
    if (brandLink) {
      homePath = linkPath(brandLink);
      const img = brandLink.querySelector('img');
      if (img) brandLink.setAttribute('aria-label', img.alt || 'Home');
    }
    top.append(brandSection);
  }

  if (navSection) {
    const nav = document.createElement('nav');
    nav.className = 'footer-nav';
    nav.setAttribute('aria-label', 'Footer navigation');
    const list = navSection.querySelector('ul');
    if (list) {
      decorateLinks(list, homePath);
      nav.append(list);
    }
    top.append(nav);
  }

  if (socialSection) {
    socialSection.className = 'footer-social';
    socialSection.querySelectorAll('a').forEach((a) => {
      const img = a.querySelector('img');
      if (!img) return;
      if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', img.alt);
      // paint the authored icon as a CSS mask so it is colored like the source icon font
      const icon = document.createElement('span');
      icon.className = 'footer-social-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.style.setProperty('--footer-icon', `url("${img.src}")`);
      img.replaceWith(icon);
    });
    top.append(socialSection);
  }

  inner.append(top);
  if (legalSection) {
    legalSection.className = 'footer-legal';
    inner.append(legalSection);
  }
  block.append(inner);
}
