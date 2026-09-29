/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards.
 * Source: https://wknd.site/us/en.html
 * Generated: 2026-09-23
 *
 * Structure (from library-description.txt): 2 columns, multiple rows.
 * First row = block name. Each subsequent row = one card:
 *   cell 1 = image (mandatory), cell 2 = title + description + CTA.
 *
 * Iteration: keyed on li.cmp-image-list__item (structure.json
 * repeatingUnitConsensus, count 4, iterationSafe:true, hasInvalidNesting:false,
 * no warnings). The <li> is a non-interactive, stable wrapper — the safe key.
 * Each card carries TWO same-href anchors (image-link + title-link) as siblings
 * inside <article>; they are NOT a card-wrapping anchor, so there is no
 * inline-wrapper collapse trap. The whole card links out: the title-link anchor
 * is preserved so its href survives the import.
 */
export default function parse(element, { document }) {
  // Iterate the stable <li> wrappers. Fallback to the <article> content wrapper
  // if the list-item class varies across pages.
  let cards = Array.from(element.querySelectorAll('li.cmp-image-list__item'));
  if (!cards.length) {
    cards = Array.from(element.querySelectorAll('.cmp-image-list__item-content, article'));
  }

  const cells = [];

  cards.forEach((card) => {
    // Image (mandatory) — first cell.
    const image = card.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Text content — second cell: title (as a link, preserving the card's href),
    // then description.
    const contentCell = [];
    const titleLink = card.querySelector('.cmp-image-list__item-title-link, a[class*="title"]');
    const title = card.querySelector('.cmp-image-list__item-title, h2, h3, h4');
    const description = card.querySelector('.cmp-image-list__item-description, [class*="description"], p');

    // Prefer the title-link anchor (keeps text + href); else the bare title.
    if (titleLink) contentCell.push(titleLink);
    else if (title) contentCell.push(title);
    if (description) contentCell.push(description);

    // Emit a row only when the card has content.
    if (image || contentCell.length) {
      cells.push([image || '', contentCell]);
    }
  });

  // Empty-block guard: no cards found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
