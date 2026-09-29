/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-gallery. Base: carousel.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Generated: 2026-09-23
 *
 * Image-only "mini" carousel (.cmp-carousel--mini). Each slide is one image with
 * no title/description/CTA, so this variant emits a single-column table: one row
 * per slide whose single cell holds the slide image.
 *
 * Iteration: keyed on .cmp-carousel__item (structure.json repeatingUnitConsensus
 * for the slide wrapper, iterationSafe:true, no nested-interactive warnings).
 * The carousel nav buttons/indicators live outside .cmp-carousel__item, so they
 * are never picked up. Image is read :scope-anchored to each slide so a malformed
 * DOM cannot pull a sibling slide's image.
 */
export default function parse(element, { document }) {
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) {
    // Fallback: carousel content wrapper's direct image children.
    slides = Array.from(element.querySelectorAll('.cmp-carousel__content > div'));
  }

  const cells = [];

  slides.forEach((slide) => {
    const image = slide.querySelector('.cmp-image img, .image img, img');
    if (image) {
      // Single column: one cell containing just the image.
      cells.push([image]);
    }
  });

  // Empty-block guard: no slide images found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
