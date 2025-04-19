const fs = require('fs');
const path = require('path');

const metadataFilePath = path.join(__dirname, '../metadata.json');
const pagesBasePath = path.join(__dirname, '..'); // Base path for HTML files (now root directory)

console.log(`[INFO] Starting metadata verification...`);
console.log(`[INFO] Reading metadata file: ${metadataFilePath}`);

let metadata;
try {
    const metadataContent = fs.readFileSync(metadataFilePath, 'utf8');
    metadata = JSON.parse(metadataContent);
    if (!metadata || !Array.isArray(metadata.pages)) {
        throw new Error("Invalid metadata format: 'pages' array not found or invalid.");
    }
    console.log(`[INFO] Successfully loaded metadata for ${metadata.pages.length} pages.`);
} catch (error) {
    console.error(`[ERROR] Failed to read or parse metadata file: ${error.message}`);
    process.exit(1);
}

const discrepancies = [];

// Helper function to extract meta tag content using a more robust regex
function extractMetaContent(htmlContent, metaName) {
    // Regex to find <meta ... name="[metaName]" ... content="[value]" ... >
    // Accounts for varying attribute order and spacing. Handles single/double quotes.
    const regex = new RegExp(
        `<meta\\s+[^>]*?name\\s*=\\s*["']${metaName}["'][^>]*?content\\s*=\\s*["']([^"']*)["'][^>]*?>`, 
        'i'
    );
    let match = htmlContent.match(regex);
    // If the above fails, try swapping the order of name and content attributes in the regex
    if (!match) {
         const regexSwapped = new RegExp(
            `<meta\\s+[^>]*?content\\s*=\\s*["']([^"']*)["'][^>]*?name\\s*=\\s*["']${metaName}["'][^>]*?>`,
            'i'
        );
         match = htmlContent.match(regexSwapped);
         // If swapped also fails, return null explicitly
         // return matchSwapped ? matchSwapped[1] : null; 
         // Correction: Use the match variable which holds either the first or second result
    }
    return match ? match[1] : null;
}

metadata.pages.forEach(page => {
    const htmlFilePath = path.join(pagesBasePath, page.path);
    console.log(`[INFO] Checking page: ${page.path}`);

    let htmlContent;
    try {
        if (!fs.existsSync(htmlFilePath)) {
            discrepancies.push({
                path: page.path,
                issue: 'HTML file not found.',
                jsonValue: 'N/A',
                htmlValue: 'File Missing'
            });
            console.warn(`[WARN] HTML file not found: ${htmlFilePath}`);
            return; // Skip to next page
        }
        htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    } catch (error) {
        discrepancies.push({
            path: page.path,
            issue: `Error reading HTML file: ${error.message}`,
            jsonValue: 'N/A',
            htmlValue: 'Read Error'
        });
        console.error(`[ERROR] Error reading HTML file ${htmlFilePath}: ${error.message}`);
        return; // Skip to next page
    }

    // --- Check publish-date ---
    const htmlPublishDate = extractMetaContent(htmlContent, 'publish-date');
    const jsonPublishDate = page['publish-date'] || 'NOT_FOUND_IN_JSON'; // Use the correct key from JSON

    if (!htmlPublishDate) {
        discrepancies.push({
            path: page.path,
            field: 'publish-date',
            issue: 'Missing <meta> tag in HTML.',
            jsonValue: jsonPublishDate,
            htmlValue: 'Missing'
        });
    } else if (htmlPublishDate.trim() !== jsonPublishDate.trim()) {
        discrepancies.push({
            path: page.path,
            field: 'publish-date',
            issue: 'Value mismatch.',
            jsonValue: jsonPublishDate,
            htmlValue: htmlPublishDate
        });
    }

    // --- Check category ---
    const htmlCategory = extractMetaContent(htmlContent, 'category');
    const jsonCategory = page.category || 'NOT_FOUND_IN_JSON';

    if (!htmlCategory) {
        discrepancies.push({
            path: page.path,
            field: 'category',
            issue: 'Missing <meta> tag in HTML.',
            jsonValue: jsonCategory,
            htmlValue: 'Missing'
        });
    } else if (htmlCategory.trim().toLowerCase() !== jsonCategory.trim().toLowerCase()) { // Case-insensitive comparison for category? Adjust if needed.
        discrepancies.push({
            path: page.path,
            field: 'category',
            issue: 'Value mismatch.',
            jsonValue: jsonCategory,
            htmlValue: htmlCategory
        });
    }

    // --- Check description ---
    const htmlDescription = extractMetaContent(htmlContent, 'description');
    const jsonDescription = page.description || 'NOT_FOUND_IN_JSON';

    if (!htmlDescription) {
        discrepancies.push({
            path: page.path,
            field: 'description',
            issue: 'Missing <meta> tag in HTML.',
            jsonValue: jsonDescription.substring(0, 50) + '...', // Show snippet
            htmlValue: 'Missing'
        });
    } else if (htmlDescription.trim() !== jsonDescription.trim()) {
         // Descriptions can be long, maybe just note mismatch without full values
         discrepancies.push({
            path: page.path,
            field: 'description',
            issue: 'Value mismatch (content may differ).',
            jsonValue: jsonDescription.substring(0, 50) + '...',
            htmlValue: htmlDescription.substring(0, 50) + '...'
        });
    }

    // --- Check keywords ---
    const htmlKeywordsStr = extractMetaContent(htmlContent, 'keywords');
    const jsonKeywords = Array.isArray(page.keywords) ? page.keywords : [];
    const jsonKeywordsStr = jsonKeywords.join(',').trim(); // Join JSON array for comparison

    if (!htmlKeywordsStr) {
        discrepancies.push({
            path: page.path,
            field: 'keywords',
            issue: 'Missing <meta> tag in HTML.',
            jsonValue: jsonKeywordsStr,
            htmlValue: 'Missing'
        });
    } else {
        // Normalize both strings for comparison (lowercase, remove extra spaces around commas)
        const normalizeKeywords = (str) => str.toLowerCase().split(',').map(k => k.trim()).filter(k => k).sort().join(',');
        const normalizedHtmlKeywords = normalizeKeywords(htmlKeywordsStr);
        const normalizedJsonKeywords = normalizeKeywords(jsonKeywordsStr);

        if (normalizedHtmlKeywords !== normalizedJsonKeywords) {
            discrepancies.push({
                path: page.path,
                field: 'keywords',
                issue: 'Value mismatch (content or order may differ).',
                jsonValue: jsonKeywordsStr,
                htmlValue: htmlKeywordsStr
            });
        }
    }
});

console.log(`[INFO] Verification finished. Checked ${metadata.pages.length} pages.`);

if (discrepancies.length === 0) {
    console.log('[SUCCESS] All checks passed! Metadata in JSON matches meta tags in HTML files.');
} else {
    console.warn(`[WARN] Found ${discrepancies.length} discrepancies:`);
    discrepancies.forEach(d => {
        console.warn(`--------------------------------------------------`);
        console.warn(`  Page : ${d.path}`);
        if (d.field) console.warn(`  Field: ${d.field}`);
        console.warn(`  Issue: ${d.issue}`);
        console.warn(`  JSON : ${d.jsonValue}`);
        console.warn(`  HTML : ${d.htmlValue}`);
    });
    console.warn(`--------------------------------------------------`);
    console.error('[FAILURE] Metadata verification failed. Please review the discrepancies above.');
    process.exitCode = 1; // Indicate failure
} 