const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

//list of all players in the team

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
  SELECT * 
  FROM cricket_team
  ORDER BY
  player_id
  `
  const playersList = await db.all(getPlayersQuery)
  response.send(playersList)
})

// creates a new player in the team

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `INSERT INTO 
  cricket_team(player_name,jersey_number,role)
  VALUES
  (
    '${playerName}',
     ${jerseyNumber},
    '${role}'
  );`
  const dbResponse = await db.run(addPlayerQuery)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

//get a player by playerid
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT * 
  FROM cricket_team
  WHERE player_id=${playerId} `
  const player = await db.get(getPlayerQuery)
  response.send(player)
})

//update player details

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
  UPDATE cricket_team
  SET 
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role='${role}'
  WHERE player_id=${playerId}`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Delete player

app.delete('/player/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM cricket_team
  WHERE player_id= ${playerId}`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
