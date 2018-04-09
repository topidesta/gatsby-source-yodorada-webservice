const deepMapKeys = require(`deep-map-keys`)
const chalk = require('chalk')
const camelCase = require('lodash/camelcase');

/*
 * option keys that are known to the api as query params
 * Following objects are possible: sort, filter, limit  
 * Object sort : {field: '__the sortable database column__', order: '__asc|desc__'}  
 * Object filter : {field: '__the filterable database column__', values: '__array with values__'}  
 * Object limit : {start: '__start form__', count: '__max entries__'}
*/
//http://de.rest-api-test.local/api/authors/?filter={"authorname":["Buddha","Coco Chanel"]}
const queryFields = [`sort`, `limit`, `filter`]

function checkUserOptions(options, endpoint) {
  if(options.constructor !== Object) {
    return '';
  }
  if(options.hasOwnProperty(endpoint)) {
    let item = options[endpoint],
        keys = Object.keys(item),
        params = keys.map(key => {
        if(queryFields.indexOf(key)===-1) return ''
        let param = '', obj = item[key]
        switch(key) {
          case 'sort':
          if(!obj.hasOwnProperty('field')) return ''
          return '_sort='+obj['field']+'&_order='+(obj.hasOwnProperty('order')?obj['order']:'')
          case 'limit':
          let start = (obj.hasOwnProperty('start') && parseInt(obj['start'])!=='NaN'?parseInt(obj['start']):0)
          let end = (obj.hasOwnProperty('count') && parseInt(obj['count'])!=='NaN'?start+parseInt(obj['count']):0)
          return '_start='+start+(end>0?'&_end='+end:'')
          break;
          case 'filter':
          if(!obj.hasOwnProperty('field') || obj['field']==='' || !obj.hasOwnProperty('values') || !Array.isArray(obj['values'])) return ''
          return 'filter={"'+obj['field']+'":["'+obj['values'].join('","')+'"]}'
          break;
          default:
          return '';
        }
    }).filter(String);
    return (params.length?'?'+params.join("&"):'');
  }
}
exports.checkUserOptions = checkUserOptions

/**
 * the following by
 * Anthony Bonventre <abonventre@gmail.com>
 * https://github.com/abonventre/gatsby-source-thirdparty
 * 
 * Thanks!
 */

// Keys that will conflict with graphql
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

/**
 * Validate the GraphQL naming conventions & protect specific fields.
 *
 * @param {any} key
 * @returns the valid name
 *
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
