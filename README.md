# gatsby-source-yodorada-webservice

Gatsby source plugin to get Yodorada RESTful API data, see: [PHP-Webservice-REST-API](https://github.com/yodorada/PHP-Webservice-REST-API).

## Install

`npm install --save gatsby-source-yodorada-webservice`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: 'gatsby-source-yodorada-webservice',
    options: {
      host: `https://www.hostname.com/api/`, // the absolute path to your RESTful API
      user: `YOUR_USERNAME`, // the login username 
      password: `YOUR_PASSWORD`, // the login password 
      apiKey: `YOUR_APIKEY`, // the unique api key 
      endpoints: [`authors`,`aphorisms`], // the endpoints from where you want to fetch
      conflictPrefix: `yo_`, // rename conflicting fields, will be camelCased (eg: yoId)
      options: {} // additional options (not yet implemented)
    }
  }
];
```

## How to query

Data will be available at the following points in GraphQL.

`allYodoradaEndpoint` or `yodoradaEndpoint` where `Endpoint` is replaced by the respective endpoint name in the configuration options.

An example: Get all entries from authors database:


```graphql
query Authors {
  allYodoradaAuthors(sort: {fields:[authorname], order: DESC}) {
    edges {
      node {
        id
        thisId
        authorname
        created
        changed
      }
    }
  }
}
```

