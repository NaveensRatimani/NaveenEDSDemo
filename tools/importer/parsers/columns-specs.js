/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-specs. Base: columns.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Generated: 2026-09-23
 *
 * Definition-list of label/value spec pairs
 * (<dl class="cmp-contentfragment__elements">). Each spec becomes one 2-column
 * row: cell 1 = label (<dt>), cell 2 = value (<dd>).
 *
 * Iteration: keyed on .cmp-contentfragment__element (structure.json repeating
 * unit ×6, iterationSafe:true, no nested-interactive warnings). Each element
 * holds exactly one <dt> title and one <dd> value.
 */
export default function parse(element, { document }) {
  let specs = Array.from(element.querySelectorAll('.cmp-contentfragment__element'));
  if (!specs.length) {
    // Fallback: any div directly under the dl that carries a dt/dd pair.
    specs = Array.from(element.querySelectorAll(':scope > div'));
  }

  const cells = [];

  specs.forEach((spec) => {
    const label = spec.querySelector('.cmp-contentfragment__element-title, dt');
    const value = spec.querySelector('.cmp-contentfragment__element-value, dd');
    // Only emit a row when at least a label or value is present; pad the missing
    // side with an empty cell so every row keeps 2 columns.
    if (label || value) {
      cells.push([label || '', value || '']);
    }
  });

  // Empty-block guard: no spec pairs found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-specs', cells });
  element.replaceWith(block);
}
