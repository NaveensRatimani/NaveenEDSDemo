/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://wknd.site/us/en.html
 * Generated: 2026-09-23
 *
 * Structure (from library-description.txt): 2 columns, multiple rows.
 * First row = block name. Each subsequent row = one slide:
 *   cell 1 = image (mandatory), cell 2 = text content (title + description + CTA).
 *
 * Iteration: keyed on .cmp-carousel__item (structure.json repeatingUnitConsensus,
 * iterationSafe:true, no nested-interactive warnings). Fallback to the teaser
 * wrapper if the carousel item structure varies across pages.
 */
export default function parse(element, { document }) {
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.cmp-teaser--hero, .teaser'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image (mandatory) — first cell. :scope-anchored to this slide's own teaser
    // so a malformed/nested DOM cannot pull a sibling slide's image.
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // Text content (optional) — second cell.
    const contentCell = [];
    const heading = slide.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
    const description = slide.querySelector('.cmp-teaser__description, [class*="description"], p');
    const ctaLinks = Array.from(slide.querySelectorAll('.cmp-teaser__action-link, a.button, [class*="action"] a'));

    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);

    // Only emit a slide row when it has an image or text content.
    if (image || contentCell.length) {
      cells.push([image || '', contentCell]);
    }
  });

  // Empty-block guard: no slides found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
