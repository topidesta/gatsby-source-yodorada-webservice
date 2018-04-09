const deepMapKeys = require(`deep-map-keys`)
const chalk = require('chalk')
const camelCase = require('lodash/camelcase');

// Keys that will conflic with graphql
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

/**
 * Validate the GraphQL naming conventions & protect specific fields.
 *
 * @param {any} key
 * @returns the valid name
 *
 * by
 * Anthony Bonventre <abonventre@gmail.com>
 * https://github.com/abonventre/gatsby-source-thirdparty
 * 
 * Thanks!
 */
function getValidKey({ key, conflictPrefix, verbose = true }) {
  let nkey = String(key)
  const NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/
  let changed = false
  // Replace invalid characters
  if (!NAME_RX.test(nkey)) {
    changed = true
    nkey = nkey.replace(/-|__|:|\.|\s/g, `_`)
  }
  // Prefix if first character isn't a letter.
  if (!NAME_RX.test(nkey.slice(0, 1))) {
    changed = true
    nkey = camelCase(`${conflictPrefix}${nkey}`)
  }
  if (restrictedNodeFields.includes(nkey)) {
    changed = true
    nkey = camelCase(`${conflictPrefix}${nkey}`.replace(/-|__|:|\.|\s/g, `_`))
  }
  if (changed && verbose)
    console.log(chalk`{bgMagenta Yodorada Webservice} Object with key "${key}" breaks GraphQL naming convention. Renamed to "${nkey}"`)

  return nkey
}

exports.getValidKey = getValidKey

// Standardize ids + make sure keys are valid.
exports.standardizeKeys = (entity, conflictPrefix)  => deepMapKeys(entity, key => (key === `ID` ? getValidKey({ key: `id`, conflictPrefix }) : getValidKey({ key, conflictPrefix })))
