function normalizeFraction(fraction: string, decimals: number) {
  if (fraction.length > decimals) {
    return fraction.slice(0, decimals)
  }

  return fraction.padEnd(decimals, '0')
}

export function parseTokenAmount(value: string, decimals: number) {
  const normalizedValue = value.trim()

  if (!/^\d+(\.\d+)?$/.test(normalizedValue)) {
    throw new Error('Enter a valid token amount.')
  }

  const [whole, fraction = ''] = normalizedValue.split('.')
  const normalizedFraction = normalizeFraction(fraction, decimals)
  const rawValue = `${whole}${normalizedFraction}`.replace(/^0+(?=\d)/, '')

  return BigInt(rawValue || '0')
}

export function formatTokenAmount(amount: bigint, decimals: number) {
  const normalized = amount.toString().padStart(decimals + 1, '0')
  const whole = normalized.slice(0, -decimals) || '0'
  const fraction = normalized.slice(-decimals).replace(/0+$/, '')

  return fraction ? `${whole}.${fraction}` : whole
}
