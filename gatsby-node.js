const Promise = require("bluebird")
const fetch = require('isomorphic-fetch')
const nanoid = require(`nanoid`)
const crypto = require(`crypto`)
const chalk = require('chalk')
const normalize = require(`./normalize`)
const btoa = (str) => Buffer.from(str).toString('base64')
const typePrefix = `yodorada__`

exports.sourceNodes = ({ boundActionCreators, createNodeId }, { host, user, password, apiKey, endpoints, options, conflictPrefix = `my_` }) => {
    const { createNode } = boundActionCreators

    const request = Object.assign(options,{
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Realm': btoa(apiKey),
          'Authorization': 'Basic '+btoa(user+':'+password)
      })
    })

    if(endpoints && !Array.isArray(endpoints)) {
      endpoints = [endpoints]
    }

    return Promise.all(endpoints.map(endpoint => {
        console.log(chalk`{bgMagenta Yodorada Webservice} Getting endpoint ${host}${endpoint}`)
        return fetch(`${host}${endpoint}`, request).then(res => res.json()).then(res => {
            res.data.map(entry => {
                entry.__type = `${typePrefix}${endpoint}`;

               // Standardize and clean keys
                entry = normalize.standardizeKeys(entry, conflictPrefix)

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
