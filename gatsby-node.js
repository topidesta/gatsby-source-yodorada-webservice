const Promise = require("bluebird")
const fetch = require('isomorphic-fetch')
const nanoid = require(`nanoid`)
const crypto = require(`crypto`)
const chalk = require('chalk')
const utils = require(`./utils`)
const btoa = (str) => Buffer.from(str).toString('base64')
const typePrefix = `yodorada__`

exports.sourceNodes = ({ boundActionCreators, createNodeId }, { host, user, password, apiKey, endpoints, options, conflictPrefix = `my_` }) => {
    const { createNode } = boundActionCreators

    if(endpoints && !Array.isArray(endpoints)) {
      endpoints = [endpoints]
    }

    const request = {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Realm': btoa(apiKey),
          'Authorization': 'Basic '+btoa(user+':'+password)
      })
    }


    return Promise.all(endpoints.map(endpoint => {
        console.log(chalk`{bgMagenta Yodorada Webservice} Getting endpoint ${host}${endpoint}`)
        let query = utils.checkUserOptions(options, endpoint);
        console.log(chalk`{bgMagenta Yodorada Webservice} Query ${query}`)
        return fetch(`${host}${endpoint}${query}`, request).then(res => res.json()).then(res => {
            res.data.map(entry => {
                entry.__type = `${typePrefix}${endpoint}`;

               // Standardize and clean keys
                entry = utils.standardizeKeys(entry, conflictPrefix)

                // Create a unique id for gatsby
                entry.id = createNodeId(`${nanoid()}`)

                const digest = crypto
                    .createHash(`md5`)
                    .update(JSON.stringify(entry))
                    .digest(`hex`)

                const node = Object.assign(
                    entry,
                    {
                      parent: `__SOURCE__`,
                      children: [],
                      internal: {
                        contentDigest: digest,
                        mediaType: `application/json`,
                        type: entry.__type
                      },
                    }
                )

                createNode(node)
                return true;
            })
        })
    })).catch(error => {
        console.log(chalk`{bgMagenta Yodorada Webservice} Error: ${error}`);
    });

}
