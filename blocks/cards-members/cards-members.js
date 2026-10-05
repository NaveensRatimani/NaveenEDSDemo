import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li — locked members-only teasers: text on top, image below */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-members-card-image';
      else div.className = 'cards-members-card-body';
    });
    /* the last paragraph of the body is the (disabled) action label */
    const body = li.querySelector('.cards-members-card-body');
    const paragraphs = body ? body.querySelectorAll(':scope > p') : [];
    if (paragraphs.length > 1) paragraphs[paragraphs.length - 1].classList.add('cards-members-card-action');
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
