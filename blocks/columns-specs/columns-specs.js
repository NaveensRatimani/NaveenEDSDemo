export default function decorate(block) {
  // Each row is a spec: cell 1 = label, cell 2 = value.
  [...block.children].forEach((row) => {
    row.classList.add('columns-specs-row');
    const cells = [...row.children];
    if (cells[0]) cells[0].classList.add('columns-specs-label');
    if (cells[1]) cells[1].classList.add('columns-specs-value');
  });
}
