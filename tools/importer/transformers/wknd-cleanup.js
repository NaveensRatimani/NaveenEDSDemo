/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. All selectors verified against migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Non-authorable global chrome that could interfere with block parsing.
    // Verified in cleaned.html:
    //   iframe#destination_publishing_iframe_wkndsite_0 (Adobe ID sync) — line 566
    //   #toggleNav (mobile nav open button) — line 568
    //   #mobileNav (mobile navigation drawer) — line 574
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0',
      '#toggleNav',
      '#mobileNav',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Header and footer are auto-populated experience fragments — excluded from content.
    // Verified in cleaned.html:
    //   header.cmp-experiencefragment--header — line 5
    //   footer.cmp-experiencefragment--footer — line 471
    // Plus safe leftover/empty elements (stray <meta> inside cmp-image blocks — e.g. line 183).
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'iframe',
      'meta',
      'link',
      'noscript',
    ]);
  }
}
