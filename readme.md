## lotion-haiku

collaborative haiku-writing app on a blockchain. built on [Lotion](https://github.com/keppel/lotion).


```
npm install -g lotion-haiku

# to join an existing chat:
haiku -j <chat id> -p <initial peers>
```

look how simple the blockchain logic is:

```js
let syllables = require('syllables')

let haikuHandler = (state, tx) => {
  if (
    typeof tx.sender === 'string' &&
    typeof tx.message === 'string' &&
    tx.message.length <= 50
  ) {
    let requiredSyllables = state.messages.length % 3 === 1 ? 7 : 5
    if (syllables(tx.message) === requiredSyllables) {
      state.messages.push({
        sender: tx.sender,
        message: tx.message
      })
    }
  }
}

lotion(haikuHandler)
```
