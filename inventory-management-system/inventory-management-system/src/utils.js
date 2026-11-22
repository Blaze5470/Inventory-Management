export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0))
}

export function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function getErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.'
  if (error.code === '23505') return 'That record already exists.'
  if (error.code === '23503') return 'This category is in use and cannot be removed.'
  if (error.code === '42501') return 'You do not have permission to perform that action.'
  return error.message || 'Something went wrong. Please try again.'
}