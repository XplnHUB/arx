/**
 * Parse URL and extract components
 * @param {string} url - Full URL or path
 * @returns {object} Parsed URL components
 */
function parseURL(url) {
  try {
    // Handle relative URLs by prepending a base
    const fullUrl = url.startsWith('http') ? url : `http://localhost${url}`;
    const parsed = new URL(fullUrl);
    
    return {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      query: Object.fromEntries(parsed.searchParams),
      href: parsed.href,
      origin: parsed.origin
    };
  } catch (err) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

export default parseURL;
