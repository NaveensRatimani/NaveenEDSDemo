/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured. Base: columns.
 * Source: https://wknd.site/us/en.html
 * Generated: 2026-09-23
 *
 * Structure (from library-description.txt): first row = block name,
 * subsequent rows have as many columns as the layout needs.
 * This variant is a single row with 2 columns:
 *   col 1 = image, col 2 = eyebrow (pretitle) + heading + description + CTA.
 *
 * structure.json: single instance, no repeating unit, no nested-interactive
 * warnings — fixed 1-row/2-col shape.
 */
export default function parse(element, { document }) {
  // Image column.
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Text column: eyebrow + heading + description + CTA.
  const textCell = [];
  const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"], [class*="eyebrow"]');
  // Heading must not fall back to [class*="title"] — that substring also matches
  // "cmp-teaser__pretitle", which would double-select the eyebrow and drop the <h2>.
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-link, a.button, [class*="action"] a'));

  if (eyebrow) textCell.push(eyebrow);
  if (heading) textCell.push(heading);
  if (description) textCell.push(description);
  textCell.push(...ctaLinks);

  // Empty-block guard.
  if (!image && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[image || '', textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
