<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Keeps an article's HTML to the blog vocabulary: the tags and gx-* block classes the website styles
 * (see frontend/src/app/blog-content.css). Anything else is removed: scripts and embeds with their
 * content, other tags unwrapped (their text kept), other attributes and classes dropped, links only
 * to web pages, mail, phone or anchors. The website then renders the result as it is.
 */
final class BlogHtml
{
    public const TAGS = ['p', 'strong', 'em', 'h2', 'h3', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'div', 'span', 'small', 'br'];

    public const CLASSES = [
        'gx-answer', 'gx-label', 'gx-keyfacts', 'gx-months', 'is-best', 'is-good', 'is-mixed', 'is-low', 'gx-table',
        'gx-tip', 'gx-note', 'gx-trips', 'gx-trip', 'gx-trip-kicker', 'gx-trip-title', 'gx-trip-text', 'gx-trip-more',
        'gx-faq', 'gx-cta', 'gx-cta-title', 'gx-actions', 'gx-btn', 'gx-btn-outline',
    ];

    /** Removed together with everything inside them. */
    private const DROP = ['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'form', 'svg', 'math', 'head', 'title', 'img', 'video', 'audio'];

    public static function clean(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }
        $doc = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="UTF-8"><div id="blog-root">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $doc->getElementById('blog-root');
        if (! $root) {
            return '';
        }
        self::walk($root);

        $out = '';
        foreach ($root->childNodes as $child) {
            $out .= $doc->saveHTML($child);
        }

        return trim($out);
    }

    private static function walk(DOMNode $node): void
    {
        // copy first: the list changes while nodes are removed or unwrapped
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child->nodeType === XML_COMMENT_NODE || $child->nodeType === XML_PI_NODE) {
                $node->removeChild($child);

                continue;
            }
            if (! $child instanceof DOMElement) {
                continue;
            }
            $tag = strtolower($child->tagName);
            if (in_array($tag, self::DROP, true)) {
                $node->removeChild($child);

                continue;
            }
            self::walk($child);
            if (! in_array($tag, self::TAGS, true)) {
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);

                continue;
            }
            self::attributes($child, $tag);
        }
    }

    private static function attributes(DOMElement $el, string $tag): void
    {
        $keep = [];
        $classes = array_values(array_intersect(preg_split('/\s+/', trim($el->getAttribute('class'))) ?: [], self::CLASSES));
        if ($classes) {
            $keep['class'] = implode(' ', $classes);
        }
        if ($tag === 'a') {
            $href = trim($el->getAttribute('href'));
            if (preg_match('#^(https?://|/|\#|mailto:|tel:)#i', $href)) {
                $keep['href'] = $href;
                if (preg_match('#^https?://#i', $href) && ! preg_match('#^https?://([a-z0-9-]+\.)*toubkal-peaks\.com(/|$)#i', $href)) {
                    $keep['rel'] = 'noopener noreferrer';
                    $keep['target'] = '_blank';
                }
            }
        }
        foreach (iterator_to_array($el->attributes) as $attr) {
            $el->removeAttribute($attr->nodeName);
        }
        foreach ($keep as $name => $value) {
            $el->setAttribute($name, $value);
        }
    }
}
