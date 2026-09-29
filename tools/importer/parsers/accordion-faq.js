/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://wknd.site/us/en/faqs.html
 * Generated: 2026-09-23
 *
 * Collapsible Q&A accordion (.accordion.panelcontainer). Items live in
 * <div class="cmp-accordion"> as repeating <div class="cmp-accordion__item">.
 * Each item has a header (<button class="cmp-accordion__button"> with
 * <span class="cmp-accordion__title"> = question) and a panel
 * (<div class="cmp-accordion__panel"> = answer rich content).
 *
 * Emits one 2-column row per accordion item: cell 1 = question (title text
 * wrapped in a <p> so no button/span markup leaks in), cell 2 = answer (the
 * panel's rich content nodes, preserving paragraphs/headings).
 *
 * Iteration: div.cmp-accordion__item is the repeating unit (structure.json
 * count ×7, iterationSafe: true, no invalid nesting). Items are plain <div>
 * siblings — not interactive elements — so there is no inline-merge or
 * item-collapse trap here.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item'));

  const cells = [];

  items.forEach((item) => {
    // Title cell: the question text from the accordion title span; fall back to
    // the button text. Wrap in a fresh <p> so button/span markup never leaks in.
    const titleEl = item.querySelector('.cmp-accordion__title')
      || item.querySelector('.cmp-accordion__button');
    const titleText = titleEl ? titleEl.textContent.trim() : '';
    const titleCell = [];
    if (titleText) {
      const p = document.createElement('p');
      p.textContent = titleText;
      titleCell.push(p);
    }

    // Content cell: the answer's rich content. Prefer the innermost text
    // wrapper(s); fall back to the whole panel so nothing is lost.
    const panel = item.querySelector('.cmp-accordion__panel');
    let contentCell = [];
    if (panel) {
      const textEls = Array.from(panel.querySelectorAll('.cmp-text'));
      if (textEls.length) {
        textEls.forEach((t) => {
          contentCell.push(...Array.from(t.childNodes));
        });
      } else {
        contentCell = Array.from(panel.childNodes);
      }
    }

    // Only emit a row when the item has a title or content.
    if (titleCell.length || contentCell.length) {
      cells.push([
        titleCell.length ? titleCell : '',
        contentCell.length ? contentCell : '',
      ]);
    }
  });

  // Empty-block guard: no accordion items found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
