function detectContentType(contentTypeHeader) {
  if (!contentTypeHeader) return null;
  return contentTypeHeader.split(';')[0].trim().toLowerCase();
}

export default detectContentType;