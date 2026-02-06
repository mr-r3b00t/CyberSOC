/**
 * CyberSOC Playbook — Cross-Page Search
 * JSON-based search index with debounced input and highlighted results
 */
(function () {
    'use strict';

    // Search index - manually maintained for static site
    var SEARCH_INDEX = [
        // Threat Intelligence
        { title: 'Intelligence Lifecycle', section: 'Planning & Direction', page: 'threat-intelligence.html', anchor: 'intelligence-lifecycle', tags: 'CTI collection processing analysis dissemination PIR' },
        { title: 'MDE Threat Analytics Integration', section: 'Threat Intelligence', page: 'threat-intelligence.html', anchor: 'mde-threat-analytics', tags: 'threat analytics reports mitigations impacted assets' },
        { title: 'IoC Management via MDE APIs', section: 'Threat Intelligence', page: 'threat-intelligence.html', anchor: 'ioc-management', tags: 'indicators compromise API submit delete FileSha256 IpAddress DomainName' },
        { title: 'Hunt for Known Malicious File Hashes', section: 'KQL - Threat Intelligence', page: 'threat-intelligence.html', anchor: 'kql-ti-hashes', tags: 'KQL DeviceFileEvents hash SHA256 hunting' },
        { title: 'Hunt for C2 Domain Communication', section: 'KQL - Threat Intelligence', page: 'threat-intelligence.html', anchor: 'kql-ti-c2', tags: 'KQL DeviceNetworkEvents C2 command control domain' },
        { title: 'MITRE ATT&CK Mapping', section: 'Threat Intelligence', page: 'threat-intelligence.html', anchor: 'mitre-mapping', tags: 'MITRE ATT&CK tactics techniques procedures TTP Navigator' },

        // Protective Monitoring
        { title: 'Alert Monitoring Workflows', section: 'Protective Monitoring', page: 'protective-monitoring.html', anchor: 'alert-monitoring', tags: 'shift handover daily monitoring alert queue' },
        { title: 'MDE Secure Score', section: 'Protective Monitoring', page: 'protective-monitoring.html', anchor: 'secure-score', tags: 'secure score exposure posture configuration compliance' },
        { title: 'ASR Rules Monitoring', section: 'Protective Monitoring', page: 'protective-monitoring.html', anchor: 'asr-monitoring', tags: 'attack surface reduction ASR rules audit block GUID' },
        { title: 'EDR Telemetry Reference', section: 'Protective Monitoring', page: 'protective-monitoring.html', anchor: 'edr-telemetry', tags: 'EDR telemetry DeviceProcessEvents DeviceNetworkEvents DeviceFileEvents DeviceRegistryEvents' },
        { title: 'False Positive Reduction', section: 'Protective Monitoring', page: 'protective-monitoring.html', anchor: 'false-positive', tags: 'false positive FP reduction tuning suppression exclusion' },
        { title: 'Unusual Process Execution', section: 'KQL - Monitoring', page: 'protective-monitoring.html', anchor: 'kql-pm-unusual-process', tags: 'KQL unusual process first seen DeviceProcessEvents' },
        { title: 'PowerShell Encoded Command', section: 'KQL - Monitoring', page: 'protective-monitoring.html', anchor: 'kql-pm-encoded-ps', tags: 'KQL PowerShell EncodedCommand obfuscation base64' },

        // Incident Management
        { title: 'Incident Classification (P1-P4)', section: 'Incident Management', page: 'incident-management.html', anchor: 'classification', tags: 'priority P1 P2 P3 P4 critical high medium low SLA' },
        { title: 'Incident Lifecycle', section: 'Incident Management', page: 'incident-management.html', anchor: 'lifecycle', tags: 'lifecycle detection triage declaration investigation containment eradication recovery closure' },
        { title: 'Communication Templates', section: 'Incident Management', page: 'incident-management.html', anchor: 'communication', tags: 'communication template notification brief stakeholder update' },
        { title: 'Escalation Matrix', section: 'Incident Management', page: 'incident-management.html', anchor: 'escalation', tags: 'escalation matrix CISO SOC manager incident commander' },
        { title: 'RACI Matrix', section: 'Incident Management', page: 'incident-management.html', anchor: 'raci', tags: 'RACI responsible accountable consulted informed roles' },
        { title: 'Post-Incident Review', section: 'Incident Management', page: 'incident-management.html', anchor: 'post-incident', tags: 'post-incident review PIR lessons learned 5-whys root cause MTTD MTTR' },

        // Alert Triage
        { title: 'Alert Severity Classification', section: 'Alert Triage', page: 'alert-triage.html', anchor: 'severity', tags: 'severity high medium low informational SLA triage' },
        { title: 'Triage Decision Tree', section: 'Alert Triage', page: 'alert-triage.html', anchor: 'decision-tree', tags: 'decision tree true positive false positive benign FP TP BTP' },
        { title: 'Initial Investigation KQL Queries', section: 'Alert Triage', page: 'alert-triage.html', anchor: 'investigation-queries', tags: 'KQL investigation timeline process tree prevalence' },
        { title: 'Enrichment Workflows', section: 'Alert Triage', page: 'alert-triage.html', anchor: 'enrichment', tags: 'enrichment VirusTotal AbuseIPDB WHOIS reputation' },
        { title: 'Alert Closure Requirements', section: 'Alert Triage', page: 'alert-triage.html', anchor: 'closure', tags: 'closure documentation classification determination notes' },

        // Incident Response
        { title: 'IR Lifecycle (NIST)', section: 'Incident Response', page: 'incident-response.html', anchor: 'ir-lifecycle', tags: 'NIST 800-61 preparation detection containment eradication recovery lessons' },
        { title: 'MDE Response Actions', section: 'Incident Response', page: 'incident-response.html', anchor: 'response-actions', tags: 'isolate restrict app execution AV scan collect investigation package stop quarantine' },
        { title: 'Live Response Commands', section: 'Incident Response', page: 'incident-response.html', anchor: 'live-response', tags: 'live response dir findfile getfile processes connections persistence putfile run remediate' },
        { title: 'Ransomware Investigation', section: 'KQL - Incident Response', page: 'incident-response.html', anchor: 'kql-ransomware', tags: 'KQL ransomware encryption shadow copy vssadmin file modification' },
        { title: 'Lateral Movement Investigation', section: 'KQL - Incident Response', page: 'incident-response.html', anchor: 'kql-lateral', tags: 'KQL lateral movement PsExec WMI RDP pass-the-hash SMB' },
        { title: 'Data Exfiltration Investigation', section: 'KQL - Incident Response', page: 'incident-response.html', anchor: 'kql-exfil', tags: 'KQL exfiltration data transfer cloud upload DNS tunneling' },
        { title: 'Persistence Investigation', section: 'KQL - Incident Response', page: 'incident-response.html', anchor: 'kql-persistence', tags: 'KQL persistence registry autorun scheduled task service WMI subscription' },
        { title: 'Credential Theft Investigation', section: 'KQL - Incident Response', page: 'incident-response.html', anchor: 'kql-credential', tags: 'KQL credential theft LSASS mimikatz procdump SAM kerberoasting' },
        { title: 'Containment Strategies', section: 'Incident Response', page: 'incident-response.html', anchor: 'containment', tags: 'containment isolate restrict network segmentation account disable' },
        { title: 'Evidence Preservation', section: 'Incident Response', page: 'incident-response.html', anchor: 'evidence', tags: 'evidence chain custody preservation hash forensic' },

        // Vulnerability Management
        { title: 'MDE TVM Assessment', section: 'Vulnerability Management', page: 'vulnerability-management.html', anchor: 'tvm-assessment', tags: 'TVM threat vulnerability management exposure score' },
        { title: 'Patch Prioritization', section: 'Vulnerability Management', page: 'vulnerability-management.html', anchor: 'patch-priority', tags: 'patch prioritization CVSS exploit active wild' },
        { title: 'Risk Scoring', section: 'Vulnerability Management', page: 'vulnerability-management.html', anchor: 'risk-scoring', tags: 'risk score classification critical high medium low CVSS' },
        { title: 'Remediation Tracking', section: 'Vulnerability Management', page: 'vulnerability-management.html', anchor: 'remediation', tags: 'remediation tracking SLA workflow ticket' },
        { title: 'Exception & Risk Acceptance', section: 'Vulnerability Management', page: 'vulnerability-management.html', anchor: 'exceptions', tags: 'exception risk acceptance compensating controls approval' },
        { title: 'Software Inventory', section: 'Vulnerability Management', page: 'vulnerability-management.html', anchor: 'software-inventory', tags: 'software inventory TVM unauthorized shadow IT EOL' },
        { title: 'Critical Vulnerabilities Query', section: 'KQL - Vulnerability Management', page: 'vulnerability-management.html', anchor: 'kql-vm-critical', tags: 'KQL DeviceTvmSoftwareVulnerabilities critical CVE' }
    ];

    var searchInput = null;
    var searchResults = null;
    var debounceTimer = null;

    function highlightMatch(text, query) {
        if (!query) return text;
        var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regex = new RegExp('(' + escaped + ')', 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function searchIndex(query) {
        if (!query || query.length < 2) return [];

        var terms = query.toLowerCase().split(/\s+/);
        var results = [];

        SEARCH_INDEX.forEach(function (entry) {
            var searchText = (entry.title + ' ' + entry.section + ' ' + entry.tags).toLowerCase();
            var score = 0;

            terms.forEach(function (term) {
                if (searchText.indexOf(term) !== -1) {
                    score += 1;
                    // Boost title matches
                    if (entry.title.toLowerCase().indexOf(term) !== -1) {
                        score += 2;
                    }
                }
            });

            if (score > 0) {
                results.push({ entry: entry, score: score });
            }
        });

        results.sort(function (a, b) { return b.score - a.score; });
        return results.slice(0, 10);
    }

    function renderResults(results, query) {
        if (!searchResults) return;

        if (results.length === 0) {
            if (query && query.length >= 2) {
                searchResults.innerHTML = '<div class="search-result-item"><span class="search-result-title" style="color: var(--text-muted)">No results found</span></div>';
                searchResults.classList.add('active');
            } else {
                searchResults.classList.remove('active');
            }
            return;
        }

        var html = '';
        results.forEach(function (r) {
            var entry = r.entry;
            html += '<a href="' + entry.page + '#' + entry.anchor + '" class="search-result-item">';
            html += '<div class="search-result-title">' + highlightMatch(entry.title, query) + '</div>';
            html += '<div class="search-result-context">' + highlightMatch(entry.section, query) + '</div>';
            html += '</a>';
        });

        searchResults.innerHTML = html;
        searchResults.classList.add('active');
    }

    function handleSearch() {
        var query = searchInput.value.trim();

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            var results = searchIndex(query);
            renderResults(results, query);
        }, 300);
    }

    function init() {
        searchInput = document.querySelector('.topbar-search input');
        searchResults = document.querySelector('.search-results');

        if (!searchInput || !searchResults) return;

        searchInput.addEventListener('input', handleSearch);

        searchInput.addEventListener('focus', function () {
            if (searchInput.value.trim().length >= 2) {
                handleSearch();
            }
        });

        // Close results on click outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.topbar-search')) {
                searchResults.classList.remove('active');
            }
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                searchResults.classList.remove('active');
                searchInput.blur();
            }
        });

        // Global keyboard shortcut: Ctrl+K or Cmd+K to focus search
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.CyberSOC = window.CyberSOC || {};
    window.CyberSOC.initSearch = init;
    window.CyberSOC.SEARCH_INDEX = SEARCH_INDEX;
})();
