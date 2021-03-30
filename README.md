Merges graphql fragments for easier debugging

## Installation / Usage
1. `yarn install`
2. Paste your graphql query inside the `query` constant
3. Run `node run.js`

## Example
Input

```
fragment Baz on User {
  three
}
fragment Bar on User {
  two
  ...Baz
}
query Foo {
  user {
    one
    ...Bar
  }
}
```
  
Output
```
query Foo {
  user {
    one
    two
    three
  }
}
```
