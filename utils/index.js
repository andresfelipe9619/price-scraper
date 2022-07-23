const defaultPrice = '$0'

function normalizePrice (price) {
  try {
    return parseFloat((price || defaultPrice).trim().replace(/(\.|\$)/gi, ''))
  } catch (error) {
    console.error(error)
    return 0
  }
}

// Parte el array en chunks de tamaño 'size'
function chunkArray (arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

module.exports = { normalizePrice, chunkArray }
