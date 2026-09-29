/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-feature. Base: hero.
 * Source: https://wknd.site/us/en.html
 * Generated: 2026-09-23
 *
 * Structure (from library-description.txt): 1 COLUMN, 3 rows.
 *   Row 1 = block name.
 *   Row 2 = background image (optional), in its single cell.
 *   Row 3 = title + subheading/description + CTA, in its single cell.
 *
 * structure.json: single instance, no meaningful repeating unit, no
 * nested-interactive warnings. 1-column shape — every content row is
 * pushed as [ [ ...elements ] ] so the elements stay inside ONE cell
 * rather than spreading into extra columns.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 2: background image (optional).
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');
  if (image) {
    cells.push([[image]]); // 1-column row: one cell holding the image.
  }

  // Row 3: title + description + CTA, all in one cell.
  const contentCell = [];
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"], p');
  const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-link, a.button, [class*="action"] a'));

  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  // Empty-block guard: nothing meaningful found.
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  if (contentCell.length) {
    cells.push([contentCell]); // 1-column row: one cell holding all content.
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-feature', cells });
  element.replaceWith(block);
}
