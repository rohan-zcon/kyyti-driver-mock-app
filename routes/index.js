var express = require('express');
var router = express.Router();
const axios = require('axios');
const fs = require("fs").promises;

const SIMULATOR_DRIVER_STATES = {
  accept: 'ACCEPT',
  arrived: 'ARRIVED',
  beginTrip: 'BEGIN_TRIP',
  dropoff: 'DROPOFF',
  goOnline: 'GO_ONLINE',
  goOffline: 'GO_OFFLINE'
};

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
    await axios({
      url: `https://sandbox-api.uber.com/v1/guests/sandbox/driver-state`,
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.UBER_AUTH}`,
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

  } catch (error) {
    console.log(error);
    // throw new Error(`In catch Error when calling ${state}: ${error.status}`);
  }

}

/* GET home page. */
router.get('/', async function (req, res, next) {
  const {run: runId} = await getData("run");
  const {state} = await getData("state");
  res.render('index', { runId, state });
});

router.get('/update', async function (req, res, next) {
  try {
    const { run: runId } = await getData("run");
    const resp = await updateUberDriveState(req.query.state, runId);
    const { state } = await getData("state");
    res.json({ state, status: "success", updatedAt: new Date() });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Somethign wrong when updating state", err: error })
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
})

module.exports = router;
