/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-upnext. Base: cards (no images).
 * Source: https://wknd.site/us/en/magazine.html
 * Generated: 2026-09-23
 *
 * Library convention (library-description.txt): Cards (no images) — a 1-column,
 * multi-row table. First row = block name. Each subsequent row = one card in a
 * single cell holding text content (heading / description / CTA). Chosen over
 * the 2-column Cards variant because this block has no images.
 *
 * Structure (from source.html): a text-only "up next" related-stories list.
 * Root <div class="list cmp-list--upnext"> wraps <ul class="cmp-list"> with
 * repeating <li class="cmp-list__item">. Each item holds one
 * <a class="cmp-list__item-link" href> that wraps two inline spans:
 *   .cmp-list__item-title (story title) and .cmp-list__item-date (publish date).
 *
 * Output: first row = block name; each subsequent row = one story in a single
 * cell = a link (title + date) preserving the story href.
 *
 * Iteration: keyed on the stable, non-interactive <li.cmp-list__item> wrapper
 * (count 4 in source). The item anchor wraps only inline <span>s — valid HTML5
 * (no anchor-in-anchor), so there is no inline-wrapper collapse or pipeline-drift
 * trap. The whole anchor is emitted so both text and href survive the import.
 */
export default function parse(element, { document }) {
  // Iterate the stable <li> wrappers. Fallback to the item links directly if
  // the list-item class varies across pages.
  let items = Array.from(element.querySelectorAll('li.cmp-list__item'));
  if (!items.length) {
    items = Array.from(element.querySelectorAll('.cmp-list__item, a.cmp-list__item-link'));
  }

  const cells = [];

  items.forEach((item) => {
    // The item link already contains the title + date spans; emit it whole so
    // both the text and the href are preserved. Single cell per row (no images).
    const link = item.matches('a') ? item : item.querySelector('a.cmp-list__item-link, a');

    if (link) {
      cells.push([link]);
    } else {
      // No anchor — fall back to the raw title + date text.
      const title = item.querySelector('.cmp-list__item-title');
      const date = item.querySelector('.cmp-list__item-date');
      const content = [];
      if (title) content.push(title);
      if (date) content.push(date);
      if (content.length) cells.push([content]);
    }
  });

  // Empty-block guard: no list items found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-upnext', cells });
  element.replaceWith(block);
}
