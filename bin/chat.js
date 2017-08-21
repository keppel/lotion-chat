#!/usr/bin/env node

let axios = require('axios')
let argv = require('minimist')(process.argv.slice(2))

let chatId = argv.j

let readline = require('readline')
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Choose your username: '
})

let port = process.env.PORT || 3003
let opts = {
  port,
  initialState: { messages: [] },
  // peers: ['localhost:46656'],
  logTendermint: false
}
if (chatId) {
  opts.genesisKey = chatId
}
let lotion = require('../../lotion')(opts)

function logMessage({ sender, message }) {
  console.log(sender + ': ' + message)
}

lotion((state, tx) => {
  if (typeof tx.sender === 'string' && typeof tx.message === 'string') {
    state.messages[state.messages.length] = {
      sender: tx.sender,
      message: tx.message
    }
  }
}).then(genesisKey => {
  console.log('chat id is ' + genesisKey)
  rl.prompt()

  let username

  function usernameError(name) {
    if (name.length > 12) {
      return 'Username is too long'
    }
    if (name.length < 3) {
      return 'Username is too short'
    }
    if (name.indexOf(' ') !== -1) {
      return 'Username may not contain a space'
    }
    return false
  }

  rl.on('line', async line => {
    line = line.trim()
    if (!username) {
      let e = usernameError(line)
      if (e) {
        console.log(e)
      } else {
        username = line
        rl.setPrompt('> ')
      }
    } else {
      let message = line
      let result = await axios({
        url: 'http://localhost:' + port + '/txs',
        method: 'post',
        params: {
          return_state: true
        },
        data: {
          message,
          sender: username
        }
      })
      updateState(result.data.state)
    }

    rl.prompt(true)
  })

  // poll blockchain state
  let lastMessagesLength = 0
  function updateState(state) {
    for (let i = lastMessagesLength; i < state.messages.length; i++) {
      logMessage(state.messages[i])
    }
    lastMessagesLength = state.messages.length
  }
  setInterval(async () => {
    let { data } = await axios.get('http://localhost:' + port + '/state')
    updateState(data)
  }, 1000)
})
