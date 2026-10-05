// "Weekday, D Mon YYYY" at the end of the link text (e.g. "Thursday, 9 Jul 2020")
const DATE_RE = /^(.*?)\s*((?:mon|tues|wednes|thurs|fri|satur|sun)day,\s*\d{1,2}\s+\S+\s+\d{4})\s*$/i;

/**
 * Splits "Title Weekday, D Mon YYYY" link text into title and date spans.
 * Links that already contain markup, or have no trailing date, keep the
 * whole text as the title.
 * @param {HTMLAnchorElement} link
 */
function splitTitleDate(link) {
  if (link.children.length) return;
  const text = link.textContent.trim();
  const [, titleText, dateText] = text.match(DATE_RE) || [];
  const title = document.createElement('span');
  title.className = 'cards-upnext-title';
  title.textContent = titleText || text;
  link.replaceChildren(title);
  if (titleText) {
    const date = document.createElement('span');
    date.className = 'cards-upnext-date';
    date.textContent = dateText;
    link.append(date);
  }
}

export default function decorate(block) {
  /* change to ul, li — text-only related-stories list */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      div.className = 'cards-upnext-item-body';
    });
    li.querySelectorAll('a[href]').forEach(splitTitleDate);
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
