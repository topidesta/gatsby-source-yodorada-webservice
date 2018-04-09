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
      conflictPrefix: `yo_`, // rename conflicting fields, will be camel cased (eg: yoId)
      options: {} // additional options (see below)
    }
  }
];
```
### Recommendation for user setup

It is recommended, that the querying user has no other rights than executing GET commands!  

## Additional options object

How to configure the additional options object in your gatsby-config.js plugin config (see above).  

The options object may contain configurations for each endpoint, which will be transformed into query strings for the API call. This comes in very useful, if you want to filter your data or if the returned data should be presorted and limited.

Following inside objects are possible: sort, filter, limit  
Object *sort* : {field: *'__the sortable database column__'*, order: *'__asc|desc__'*}  
Object *filter* : {field: *'__the filterable database column__'*, values: *'__array with values__'*}  
Object *limit* : {start: *'__start form__'*, count: *'__max entries__'*}

```javascript
// the additional options object - in this case for both endpoints 'authors' and 'aphorisms'
// 
options: {
  authors: {
    sort: {
      field: 'authorname',
      order: 'desc'
    },
    filter: {
      field: 'authorname',
      values:['Buddha','Coco Chanel']
    }
  },
// Note: the aphorisms options won't work in the demo setup for the api for there are not enough entries
  aphorisms: {
    sort: {
      field: 'created',
      order: 'desc'
    },
    limit: {
      start: 10,
      count: 20
    }
  }
}
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
        yoId
        authorname
        created
        changed
      }
    }
  }
}
```

