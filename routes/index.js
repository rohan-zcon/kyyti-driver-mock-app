var express = require('express');
var router = express.Router();
const axios = require('axios');

const SIMULATOR_DRIVER_STATES = {
  accept: 'ACCEPT',
  arrived: 'ARRIVED',
  beginTrip: 'BEGIN_TRIP',
  dropoff: 'DROPOFF',
  goOnline: 'GO_ONLINE',
  goOffline: 'GO_OFFLINE'
};

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

    
  } catch (error) {
    console.log(error);
    // throw new Error(`In catch Error when calling ${state}: ${error.status}`);
  }

}


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/update', async function (req, res, next) {
  try {
    const resp = await updateUberDriveState(req.query.state, req.query.runId);
    res.json({ runId, state: req.query.state, status: "success", updatedAt: new Date() });
  } catch (error) {
    console.log(error);
    res.status(500).json("Somethign wrong")
  }
});

module.exports = router;
