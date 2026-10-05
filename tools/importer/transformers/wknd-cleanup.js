/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. All selectors verified against migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const SITE_HOSTS = ['wknd.site', 'www.wknd.site'];

/**
 * Filter tabs over card lists (adventures listing): the first ("All") panel
 * holds every item and the other panels repeat subsets. Replace the whole tabs
 * component with the first panel's list so it imports as one card grid.
 * Content tabs (adventure detail pages) contain no .image-list and are untouched.
 */
function flattenListFilterTabs(element) {
  element.querySelectorAll('.tabs.panelcontainer').forEach((tabs) => {
    const allList = tabs.querySelector('.cmp-tabs__tabpanel .image-list');
    if (allList) tabs.replaceWith(allList);
  });
}

/**
 * Rewrite internal WKND links to Edge Delivery paths: same-site absolute URLs
 * become root-relative and the ".html" extension is dropped. Hash and query
 * are preserved; assets (e.g. .pdf) and external links are left as-is.
 */
function rewriteInternalLinks(element) {
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return;
    let url;
    try {
      url = new URL(href, 'https://wknd.site');
    } catch (e) {
      return;
    }
    if (!SITE_HOSTS.includes(url.hostname) || !/\.html$/i.test(url.pathname)) return;
    const path = url.pathname.replace(/\.html$/i, '');
    a.setAttribute('href', `${path}${url.search}${url.hash}`);
  });
}

/**
 * Standalone WKND buttons (e.g. "All Articles", "All Trips") become bold links,
 * which Edge Delivery decorates as buttons. Icon-only buttons (social links) are
 * left alone; buttons inside blocks are handled by the block parsers.
 */
function boldStandaloneButtons(element, document) {
  element.querySelectorAll('.button:not(.cmp-button--icononly) a.cmp-button').forEach((a) => {
    const label = (a.querySelector('.cmp-button__text') || a).textContent.trim();
    if (!label || a.closest('strong')) return;
    a.textContent = label;
    const strong = document.createElement('strong');
    a.replaceWith(strong);
    strong.append(a);
  });
}

/**
 * Page titles only carry the yellow underline when the source title uses the
 * .cmp-title--underline style (FAQs, adventure detail pages). Mark the section
 * holding such an h1 with the "title-underline" section style.
 */
function markUnderlinedPageTitles(element, document) {
  element.querySelectorAll('.title.cmp-title--underline').forEach((title) => {
    if (!title.querySelector('h1')) return;
    const metadata = WebImporter.Blocks.createBlock(document, {
      name: 'Section Metadata',
      cells: { style: 'title-underline' },
    });
    title.after(metadata);
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    flattenListFilterTabs(element);
    boldStandaloneButtons(element, payload.document);

    // Non-authorable global chrome that could interfere with block parsing.
    // Verified in cleaned.html:
    //   iframe#destination_publishing_iframe_wkndsite_0 (Adobe ID sync) — line 566
    //   #toggleNav (mobile nav open button) — line 568
    //   #mobileNav (mobile navigation drawer) — line 574
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0',
      '#toggleNav',
      '#mobileNav',
      // content fragment titles repeat the page title and are always hidden on the source
      '.cmp-contentfragment__title',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    markUnderlinedPageTitles(element, payload.document);

    // Header and footer are auto-populated experience fragments — excluded from content.
    // Verified in cleaned.html:
    //   header.cmp-experiencefragment--header — line 5
    //   footer.cmp-experiencefragment--footer — line 471
    // Plus safe leftover/empty elements (stray <meta> inside cmp-image blocks — e.g. line 183).
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'iframe',
      'meta',
      'link',
      'noscript',
    ]);
    rewriteInternalLinks(element);
  }
}
