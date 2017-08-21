let Lotion = require('../lotion/')
let axios = require('axios')

let lotion = Lotion({
  initialState: { messages: [] },
  port: 3001,
  genesisKey: 'a422797b30235b63c6ce70f202900cdde98544d357e1305cbeaf305b943c8859',
  path: __dirname + '/tm-data2',
  logTendermint: true
})

lotion((state, tx) => {
  if (typeof tx.sender === 'string' && typeof tx.message === 'string') {
    state.messages.push({ sender: tx.sender, message: tx.message })
  }
}).then(genesis => {
  console.log('genesis key: ' + genesis)
  setTimeout(() => {
    axios.post('http://localhost:3001/txs', {
      sender: 'judd',
      message: 'hey dude!'
    })
  }, 5000)
})
