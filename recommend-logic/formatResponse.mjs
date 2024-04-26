export function formatResponse(body, statusCode = 200) {
  return { body, statusCode };
}

export function formatErrorResponse(errorObj, statusCode = 500) {
  return formatResponse({ error: errorObj }, statusCode);
}
