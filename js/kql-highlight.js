/**
 * CyberSOC Playbook — KQL Syntax Highlighter
 * Client-side regex-based highlighting for Kusto Query Language
 */
(function () {
    'use strict';

    const KQL_TABLES = [
        'DeviceProcessEvents', 'DeviceNetworkEvents', 'DeviceFileEvents',
        'DeviceRegistryEvents', 'DeviceLogonEvents', 'DeviceEvents',
        'DeviceImageLoadEvents', 'DeviceInfo', 'DeviceNetworkInfo',
        'DeviceFileCertificateInfo', 'DeviceTvmSoftwareVulnerabilities',
        'DeviceTvmSoftwareInventory', 'DeviceTvmSecureConfigurationAssessment',
        'DeviceTvmBrowserExtensions', 'DeviceTvmInfoGathering',
        'AlertInfo', 'AlertEvidence', 'EmailEvents', 'EmailAttachmentInfo',
        'EmailUrlInfo', 'IdentityLogonEvents', 'IdentityQueryEvents',
        'IdentityDirectoryEvents', 'CloudAppEvents', 'UrlClickEvents',
        'DeviceTvmSoftwareEvidenceBeta', 'DeviceTvmCertificateInfo',
        'ExposureGraphNodes', 'ExposureGraphEdges'
    ];

    const KQL_KEYWORDS = [
        'where', 'project', 'project-away', 'project-rename', 'project-reorder',
        'extend', 'summarize', 'join', 'union', 'let', 'search', 'count', 'top',
        'sort', 'order', 'by', 'asc', 'desc', 'render', 'ago', 'bin', 'startswith',
        'endswith', 'contains', 'has', 'has_any', 'has_all', 'in', 'between', 'distinct',
        'take', 'limit', 'mv-expand', 'mv-apply', 'parse', 'evaluate', 'datatable',
        'print', 'invoke', 'externaldata', 'materialize', 'toscalar', 'range',
        'getschema', 'facet', 'lookup', 'as', 'on', 'kind', 'inner', 'outer',
        'left', 'right', 'anti', 'semi', 'fullouter', 'innerunique',
        'with', 'of', 'pack', 'pack_all', 'bag_pack'
    ];

    const KQL_OPERATORS = [
        '==', '!=', '>=', '<=', '!~', '=~',
        'and', 'or', 'not', 'contains_cs', 'notcontains',
        '!has', '!contains', '!startswith', '!endswith',
        'matches\\s+regex', 'has_cs', '!has_cs',
        '!in', 'in~', '!in~', 'between'
    ];

    const KQL_FUNCTIONS = [
        'count', 'dcount', 'dcountif', 'countif', 'sum', 'sumif', 'avg', 'avgif',
        'min', 'minif', 'max', 'maxif', 'arg_max', 'arg_min', 'any',
        'make_set', 'make_set_if', 'make_list', 'make_list_if', 'make_bag',
        'strcat', 'strcat_delim', 'tostring', 'toint', 'tolong', 'todouble',
        'todecimal', 'todatetime', 'totimespan', 'tobool',
        'format_datetime', 'format_timespan', 'datetime_diff',
        'now', 'ago', 'startofday', 'startofweek', 'startofmonth', 'startofyear',
        'endofday', 'endofweek', 'endofmonth', 'endofyear',
        'parse_json', 'parse_url', 'parse_path', 'parse_urlquery',
        'extract', 'extract_all', 'extractjson',
        'strlen', 'substring', 'replace', 'replace_string', 'replace_regex',
        'split', 'trim', 'trim_start', 'trim_end',
        'toupper', 'tolower', 'reverse',
        'iff', 'iif', 'case', 'coalesce',
        'isempty', 'isnotempty', 'isnull', 'isnotnull', 'isnan', 'isinf',
        'set_intersect', 'set_difference', 'set_union', 'set_has_element',
        'array_length', 'array_concat', 'array_slice', 'array_sort_asc',
        'bag_keys', 'bag_values', 'bag_merge',
        'hash', 'hash_sha256', 'hash_md5', 'base64_decode_tostring',
        'base64_encode_tostring', 'url_decode', 'url_encode',
        'ipv4_is_private', 'ipv4_is_match', 'ipv4_compare',
        'geo_point_to_geohash', 'geo_geohash_to_central_point',
        'prev', 'next', 'row_number', 'row_cumsum', 'row_rank',
        'percentile', 'percentiles', 'stdev', 'variance',
        'binary_and', 'binary_or', 'binary_xor', 'binary_not',
        'series_stats', 'series_fill_linear', 'series_outliers'
    ];

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function highlightKQL(code) {
        var tokens = [];
        var text = code;

        // Tokenize: find all special tokens and their positions
        var patterns = [];

        // Comments: // to end of line
        patterns.push({ regex: /\/\/[^\n]*/g, cls: 'kql-comment' });

        // Strings: single and double quoted
        patterns.push({ regex: /"(?:[^"\\]|\\.)*"/g, cls: 'kql-string' });
        patterns.push({ regex: /'(?:[^'\\]|\\.)*'/g, cls: 'kql-string' });

        // Time literals: 1d, 7d, 30m, 24h, etc.
        patterns.push({ regex: /\b\d+(?:d|h|m|s|ms|tick|microsecond|min)\b/g, cls: 'kql-time' });

        // Numbers
        patterns.push({ regex: /\b\d+(?:\.\d+)?\b/g, cls: 'kql-number' });

        // Pipe operator
        patterns.push({ regex: /\|/g, cls: 'kql-pipe' });

        // Table names (must be before keywords to take precedence)
        var tablePattern = new RegExp('\\b(' + KQL_TABLES.map(escapeRegExp).join('|') + ')\\b', 'g');
        patterns.push({ regex: tablePattern, cls: 'kql-table' });

        // Functions (word followed by opening paren)
        var funcPattern = new RegExp('\\b(' + KQL_FUNCTIONS.map(escapeRegExp).join('|') + ')\\s*\\(', 'g');
        patterns.push({ regex: funcPattern, cls: 'kql-function', keepTrailing: true });

        // Operators (multi-char first)
        var opPattern = new RegExp('(?:' + KQL_OPERATORS.map(escapeRegExp).join('|') + ')', 'g');
        patterns.push({ regex: opPattern, cls: 'kql-operator' });

        // Keywords
        var kwPattern = new RegExp('\\b(' + KQL_KEYWORDS.map(escapeRegExp).join('|') + ')\\b', 'gi');
        patterns.push({ regex: kwPattern, cls: 'kql-keyword' });

        // Collect all matches
        patterns.forEach(function (p) {
            var match;
            p.regex.lastIndex = 0;
            while ((match = p.regex.exec(text)) !== null) {
                var matchText = match[0];
                var start = match.index;

                // For functions, only highlight the function name, not the paren
                if (p.keepTrailing) {
                    matchText = matchText.replace(/\s*\($/, '');
                }

                tokens.push({
                    start: start,
                    end: start + matchText.length,
                    text: matchText,
                    cls: p.cls,
                    priority: patterns.indexOf(p)
                });
            }
        });

        // Sort by position, then by priority (lower index = higher priority for overlaps)
        tokens.sort(function (a, b) {
            return a.start - b.start || a.priority - b.priority;
        });

        // Remove overlapping tokens (first match wins for a position)
        var filtered = [];
        var lastEnd = 0;
        tokens.forEach(function (t) {
            if (t.start >= lastEnd) {
                filtered.push(t);
                lastEnd = t.end;
            }
        });

        // Build highlighted HTML
        var result = '';
        var pos = 0;
        filtered.forEach(function (t) {
            // Add any text before this token
            if (t.start > pos) {
                result += escapeHtml(text.substring(pos, t.start));
            }
            result += '<span class="' + t.cls + '">' + escapeHtml(t.text) + '</span>';
            pos = t.end;
        });
        // Add remaining text
        if (pos < text.length) {
            result += escapeHtml(text.substring(pos));
        }

        return result;
    }

    function init() {
        var codeBlocks = document.querySelectorAll('code.language-kql');
        codeBlocks.forEach(function (block) {
            var raw = block.textContent;
            block.innerHTML = highlightKQL(raw);
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for dynamic content
    window.CyberSOC = window.CyberSOC || {};
    window.CyberSOC.highlightKQL = highlightKQL;
    window.CyberSOC.initKQLHighlight = init;
})();
