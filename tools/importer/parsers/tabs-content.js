/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-content. Base: tabs.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Generated: 2026-09-23
 *
 * Tab switcher (.tabs.panelcontainer). Labels live in
 * <ol class="cmp-tabs__tablist"> as <li class="cmp-tabs__tab">; each panel is a
 * <div class="cmp-tabs__tabpanel"> in document order. Emits one 2-column row per
 * tab: cell 1 = tab label, cell 2 = panel rich content (paragraphs, image, list).
 *
 * Iteration: tabs and panels are separate iterationSafe repeating units (the tabs
 * are <li>, the panels are sibling <div class="cmp-tabs__tabpanel">), paired by
 * index. The list-based tab labels are read as plain text into a fresh <p> so a
 * label never carries the <li>/<ol> markup into the cell. Panel content is taken
 * from the panel's content-fragment body, or the whole panel as a fallback.
 */
export default function parse(element, { document }) {
  const tabLabels = Array.from(element.querySelectorAll('.cmp-tabs__tab'));
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  const cells = [];

  panels.forEach((panel, i) => {
    // Label cell: prefer the matching tab <li> text; wrap in a <p> so no list
    // markup leaks into the cell.
    const labelCell = [];
    const labelEl = tabLabels[i];
    const labelText = labelEl ? labelEl.textContent.trim() : '';
    if (labelText) {
      const p = document.createElement('p');
      p.textContent = labelText;
      labelCell.push(p);
    }

    // Content cell: the content-fragment element body holds the panel's rich
    // content (paragraphs, image, list). Fall back to the whole panel.
    let contentSource = panel.querySelector('.cmp-contentfragment__elements');
    if (!contentSource) {
      contentSource = panel;
    }
    // Take the actual child nodes so headings/images/lists/paragraphs are
    // preserved as elements rather than flattened to text.
    const contentCell = Array.from(contentSource.childNodes);

    // Only emit a tab row when it has a label or content.
    if (labelCell.length || contentCell.length) {
      cells.push([labelCell.length ? labelCell : '', contentCell.length ? contentCell : '']);
    }
  });

  // Empty-block guard: no tab panels found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-content', cells });
  element.replaceWith(block);
}
