'use strict'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

function parsePagination(value, options = {}) {
  const defaultLimit = options.defaultLimit || DEFAULT_LIMIT
  const maxLimit = options.maxLimit || MAX_LIMIT
  const requestedLimit = Number(value && value.limit)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), maxLimit)
    : defaultLimit

  return {
    limit,
    cursor: value && value.cursor ? decodeCursor(value.cursor) : null
  }
}

function encodeCursor(value) {
  if (!value) return null
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64')
}

function decodeCursor(value) {
  try {
    const cursor = JSON.parse(Buffer.from(String(value), 'base64').toString('utf8'))
    if (!cursor || typeof cursor !== 'object') throw new Error('cursor inválido')
    return cursor
  } catch (error) {
    const invalidCursor = new Error('El cursor de paginación no es válido.')
    invalidCursor.statusCode = 400
    throw invalidCursor
  }
}

function pageResult(documents, limit, cursorFromDocument) {
  const hasMore = documents.length > limit
  const items = hasMore ? documents.slice(0, limit) : documents
  const last = items.length ? items[items.length - 1] : null

  return {
    items,
    pagination: {
      limit,
      hasMore,
      nextCursor: hasMore && last ? encodeCursor(cursorFromDocument(last)) : null
    }
  }
}

module.exports = {
  parsePagination,
  pageResult
}
