import { createOptimizedPicture } from '../../scripts/aem.js';

const SOCIAL_NETWORKS = ['facebook', 'twitter', 'instagram'];

export default function decorate(block) {
  /* change to ul, li — grid of contributor cards */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-contributor-card-image';
      else div.className = 'cards-contributor-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  /* social links render as icon buttons; the network is taken from the link text */
  ul.querySelectorAll('.cards-contributor-card-body a').forEach((a) => {
    const label = a.textContent.trim().toLowerCase();
    const network = SOCIAL_NETWORKS.find((name) => label.includes(name));
    if (!network) return;
    a.classList.add('cards-contributor-social', `cards-contributor-social-${network}`);
    const p = a.closest('p');
    if (p && p.textContent.trim() === a.textContent.trim()) p.classList.add('cards-contributor-social-item');
  });

  block.textContent = '';
  block.append(ul);
}
