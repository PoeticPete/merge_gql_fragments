import gql from 'graphql-tag';
import { print } from 'graphql'

 
const query = gql`
PASTE QUERY HERE
`

const mergeGql = (query) => {
  /**
   * 
   * get all fragments, store in a dictionary NAME -> fragment
   * for each fragment replace each fragment spread with fields
   * dfs over each FragmentSpread, and replace each FragmentSpread with fields
   * delete all fragment definitions
   * print result
   * 
   */
  
  // find all FragmentDefinitions
  let definitions = JSON.parse(JSON.stringify(query.definitions))
  let fragmentDefinitions = definitions.filter((definition) => definition.kind === 'FragmentDefinition')
  let fragments = {}  // name --> Fragment

  fragmentDefinitions.forEach((definition) => {
    fragments[definition.name.value] = definition
  })

  // replace each FragmentSpread with the corresponding fragment
  const replaceFragmentSpreads = (input) => {
    let queue = [input]
    
    while (queue.length > 0) {
      let curr = queue.shift()
      if (!curr.selectionSet) {
        continue
      }
      let selections = curr.selectionSet.selections
      for(let i = 0; i < selections.length; i++) {
        const selection = selections[i]
        if (selection.kind === "FragmentSpread") {
          const name = selection.name.value
          selections.push(...fragments[name].selectionSet.selections)
        } else {
          queue.push(selection)
        }
      }
    }

    // Delete FragmentSpreads
    queue.push(input)
    while (queue.length > 0) {
      let curr = queue.shift()
      if (curr.selectionSet) {
        curr.selectionSet.selections = curr.selectionSet.selections.filter(selection => selection.kind !== "FragmentSpread")
        queue.push(...curr.selectionSet.selections)
      }
    }

    // Delete duplicates
    queue.push(input)
    while (queue.length > 0) {
      let curr = queue.shift()
      if (curr.selectionSet) {
        const seen = new Set()
        const res = []
        for (var i in curr.selectionSet.selections) {
          const selection = curr.selectionSet.selections[i]
          if (seen.has(selection.name.value)) {
            continue
          }
          res.push(selection)
          seen.add(selection.name.value)
        }
        curr.selectionSet.selections = res
        queue.push(...curr.selectionSet.selections)
      }
    }
  }

  for (var key in fragments) {
    replaceFragmentSpreads(fragments[key])
  }

  query.definitions = query.definitions.filter(definition => definition.kind !== "FragmentDefinition")
  for (var i in query.definitions) {
    replaceFragmentSpreads(query.definitions[i])
  }  
}

mergeGql(query)

console.log(print(query)) 
