/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-members. Base: cards.
 * Source: https://wknd.site/us/en/magazine.html
 * Generated: 2026-10-05
 *
 * Structure (from library-description.txt): 2 columns, multiple rows.
 * First row = block name. Each subsequent row = one card:
 *   cell 1 = image (mandatory), cell 2 = title + description + CTA.
 *
 * Members-only (secure) teasers: each source teaser is a separate
 * .teaser.cmp-teaser--secure grid column with title, description, a
 * non-link "Read More" action label (the CTA, disabled on the source) and an
 * image. The first matched teaser collects every consecutive secure teaser
 * sibling into ONE block and removes the siblings, so the import loop skips
 * them (detached elements are not parsed again).
 */
export default function parse(element, { document }) {
  const teasers = [element];
  let next = element.nextElementSibling;
  while (next && next.matches('.teaser.cmp-teaser--secure')) {
    teasers.push(next);
    next = next.nextElementSibling;
  }

  const cells = [];
  teasers.forEach((teaser) => {
    // Image (mandatory) — first cell.
    const image = teaser.querySelector('.cmp-teaser__image img, img');

    // Text content — second cell: title (heading), description, CTA label.
    const contentCell = [];
    const title = teaser.querySelector('.cmp-teaser__title, h2, h3');
    const description = teaser.querySelector('.cmp-teaser__description');
    const cta = teaser.querySelector('.cmp-teaser__action-container');

    if (title) {
      const heading = document.createElement('h3');
      heading.textContent = title.textContent.trim();
      contentCell.push(heading);
    }
    if (description && description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      contentCell.push(p);
    }
    if (cta && cta.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cta.textContent.trim();
      contentCell.push(p);
    }

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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-members', cells });
  teasers.slice(1).forEach((teaser) => teaser.remove());
  element.replaceWith(block);
}
