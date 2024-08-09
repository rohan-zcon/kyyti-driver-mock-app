var express = require('express');
var router = express.Router();
const axios = require('axios');
const fs = require("fs").promises;
const moment = require('moment');
const qs = require('qs')

/**
 * @type {{token: string, expiry: string}} authToken
 */
let authToken;
const TOKEN_EXPIRY_DAYS = 28;

const SIMULATOR_DRIVER_STATES = {
  accept: 'ACCEPT',
  arrived: 'ARRIVED',
  beginTrip: 'BEGIN_TRIP',
  dropoff: 'DROPOFF',
  goOnline: 'GO_ONLINE',
  goOffline: 'GO_OFFLINE'
};

async function getToken() {
try {
    if (authToken && moment().isBefore(authToken.expiry)){
      console.log('using cached token');
      return `Bearer ${authToken.token}`;
    }
  
    console.log('cached token expired. refreshing token');
  
    const params = {
      client_id: process.env.UBER_CLIENT_ID,
      client_secret: process.env.UBER_CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'guests.trips'
    };
    console.log(params);
  
    const { data } = await axios({
      url: 'https://auth.uber.com/oauth/v2/token',
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(params)
    });
  
    authToken = {
      token: data.access_token,
      expiry: moment().add(TOKEN_EXPIRY_DAYS, 'days')
    };
    return `Bearer ${data.access_token}`;
  
} catch (error) {
  console.error(`err when refreshing auth: `)
  console.error(error);
  throw new Error(error)
}
}

async function getData(key) {
  const data = await fs.readFile(`./data/${key}.json`, 'utf-8');
  const parsedData = await JSON.parse(data);
  return parsedData;
}

async function setData(key, value) {
  const newData = {};
  newData[key] = value;
  const jsonString = JSON.stringify(newData);
  const resp = await fs.writeFile(`./data/${key}.json`, jsonString);
  console.log(`resp`);
  console.log(resp);
}
async function updateUberDriveState(state, runId) {
  try {
    console.log({
      run_id: runId,
      driver_id: "actor-driver-a",
      driver_state: SIMULATOR_DRIVER_STATES[state]
    });
    const token = await getToken();
    await axios({
      url: `https://sandbox-api.uber.com/v1/guests/sandbox/driver-state`,
      method: 'POST',
      headers: {
        authorization: token,
        'content-type': 'application/json',
        'x-uber-organizationuuid': process.env.UBER_ORGANIZATION_ID
      },
      data: {
        run_id: runId,
        driver_id: "actor-driver-a",
        driver_state: SIMULATOR_DRIVER_STATES[state]
      }
    });

    await setData("state", SIMULATOR_DRIVER_STATES[state] );
    await setData("time", new Date());

  } catch (error) {
    console.log(error.response.data);
    throw new Error(`In catch Error when calling ${state}: ${error.response.status}- ${JSON.stringify(error.response.data)}`);
  }

}

/* GET home page. */
router.get('/', async function (req, res, next) {
  await getToken();
  const {run: runId} = await getData("run");
  const {state} = await getData("state");
  const {time} = await getData("time");
  console.log(time)
  res.render('index', { runId, state, time, tokExpiry: authToken.expiry });
});

router.get('/update', async function (req, res, next) {
  try {
    const { run: runId } = await getData("run");
    const resp = await updateUberDriveState(req.query.state, runId);
    const { state } = await getData("state");
    const {time} = await getData("time");
    res.json({ state, status: "success", updatedAt: time});
  } catch (error) {
    console.log(error.message);
    res.status(500).send({msg: error.message});
  }
});

router.get('/set', async function (req, res, next) {
  try {
    const newRun = req.query.runId;
    await setData("run", newRun)
    // await setData("state", SIMULATOR_DRIVER_STATES.goOnline);
    res.json({ status: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Somethign wrong when setting runid", err: error })
  }
});
module.exports = router;
