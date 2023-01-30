# Hedera Hashpool Explorer

This tool provides a user interface for exploring the in-memory state of an Hedera Hashpool instance.

## Disclaimer

> This is alpha software. It has not been audited. *Use at your own risk.*

## Technologies

- [TypeScript](https://www.typescriptlang.org)
- [Node.js](https://nodejs.org/en/)
- [HAPI Utility Packages](https://github.com/bugbytesinc/hapi-proto)
- [Vue.js](https://vuejs.org/)

## Getting started

### Installation

1. `git clone https://github.com/the-creators-galaxy/hashpool-explorer.git`
2. `cd hashpool-explorer`
3. `npm install`

### Running the project

1. `cp sample.env .env`
1. `npm run dev`
2. Navigate a web browser to the URL indicated in the console window.

The environmental property `VITE_API_HASHPOOL_URL`
instructs the website on which Hashpool REST Server
to connect to when subbmitting transactions.

## How it works

Upon loading, the site connects to the hashpool server to retrieve 
information regarding the Hedera network to connect to, including a mirror 
node.  From there it provides a user interface for exploring the transactions
held in-memory, that may still need additional signatures to be valid, or 
are not yet submittable due to their transaction start time.  It provides
this information by querying the hashpool directly thru its REST API and also
the associated mirror node for additional information.  Completed transactions
are typically held in memory for around 3 minutes after submittal, after which
the user must use a different explorer to discover the disposition of a transaction.
