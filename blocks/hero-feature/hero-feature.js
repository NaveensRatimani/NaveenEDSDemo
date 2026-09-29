export default function decorate(block) {
  const rows = [...block.children];

  // Identify the image row (contains a picture) and the content row.
  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    if (row.querySelector('picture')) {
      row.classList.add('hero-feature-image');
      cell.classList.add('hero-feature-image');
    } else {
      row.classList.add('hero-feature-content');
      cell.classList.add('hero-feature-content');
    }
  });

  if (!block.querySelector(':scope > div picture')) {
    block.classList.add('no-image');
  }
}
