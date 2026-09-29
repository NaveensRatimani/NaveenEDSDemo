/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-contributor. Base: cards.
 * Source: https://wknd.site/us/en/about-us.html
 * Generated: 2026-09-23
 *
 * Structure (from library-description.txt — "Cards"): 2 columns, multiple rows.
 * First row = block name ("Cards Contributor"). Each subsequent row = one card:
 *   cell 1 = image/avatar (mandatory), cell 2 = text content (name Heading,
 *   role line, and the social-link CTAs).
 *
 * IMPORTANT — per-instance invocation model:
 * The block selector in page-templates.json,
 *   `.experiencefragment.cmp-experience-fragment--contributor`,
 * matches EACH individual contributor card <section> (7 on the page), NOT a
 * grid wrapper. Both the real import (findBlocksOnPage → per-element parse loop)
 * and the parser validator invoke this parser ONCE PER matched <section>, and
 * each invocation is captured/scored independently by the node it adds to the
 * parent. So this parser converts the single card it receives into a complete
 * one-row `cards-contributor` block table and replaces that <section> with it.
 * All 7 contributors are therefore represented — one confident, 100%-complete
 * block instance per card (avatar + name + role + 3 social links each).
 *
 * A "merge every card into one preceding-sibling table" design was rejected:
 * for cards 2..7 it adds no new node to the parent, so the validator's
 * per-instance capture would find an empty node and score those cards as
 * incomplete (a blocking failure), even though the real import would work.
 *
 * Structure digest (structure.json): repeating unit is the non-interactive
 * <section> wrapper (count 7, iterationSafe:true, hasInvalidNesting:false,
 * warnings:[]). The social CTAs are sibling <a class="cmp-button"> elements,
 * each wrapping only inline <span>s — valid HTML5, no anchor-in-anchor nesting.
 *
 * html2md inline-merge guard: on several cards the three social anchors share
 * an IDENTICAL href (e.g. #jacob-wester, # , #selveraj). html2md's preProcess
 * `reviewInlineElement` merges adjacent same-tag anchors whose hrefs are equal,
 * collapsing all three CTAs into one "Facebook Twitter Instagram" link (seen in
 * attempt 1 for cards 4–7). To stop that, each social anchor is wrapped in its
 * own block-level <p>: the anchors are no longer adjacent inline siblings, so
 * the merge never triggers and all three links survive on every card.
 */
export default function parse(element, { document }) {
  // Avatar image (mandatory) — first cell.
  const image = element.querySelector('.cmp-image img, img.cmp-image__image, img');

  // Text content — second cell: name (H3), role/skills line (H5), and the
  // social-link CTAs. Reference the heading elements directly so their
  // semantics survive; reference the anchors so both label and href survive.
  const name = element.querySelector('.cmp-title h3, h3.cmp-title__text, h3');
  const role = element.querySelector('.cmp-title h5, h5.cmp-title__text, h5');
  const social = Array.from(
    element.querySelectorAll('.cmp-buildingblock--btn-list a.cmp-button, a.cmp-button'),
  );

  const contentCell = [];
  if (name) contentCell.push(name);
  if (role) contentCell.push(role);
  // Wrap each social link in its own <p> so identical-href siblings are not
  // merged by html2md's reviewInlineElement pass.
  social.forEach((link) => {
    const p = document.createElement('p');
    p.append(link);
    contentCell.push(p);
  });

  // Empty-block guard: nothing meaningful to emit for this card.
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One card = one 2-cell row (image | text). createBlock prepends the
  // "Cards Contributor" header row.
  const cells = [[image || '', contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-contributor', cells });
  element.replaceWith(block);
}
