const runId = "123";
const SIMULATOR_DRIVER_STATES = {
    accept: 'ACCEPT',
    arrived: 'ARRIVED',
    beginTrip: 'BEGIN_TRIP',
    dropoff: 'DROPOFF',
    goOnline: 'GO_ONLINE',
    goOffline: 'GO_OFFLINE'
};


const runIdEle = document.querySelector(".runId");
runIdEle.innerHTML = `Current runId: ${runId}`

const driverState = document.querySelector(".driverState");
const stateUpdatedAt = document.querySelector(".stateUpdatedAt");
const newRunId = document.querySelector(".runIdIp");


const arrBtn = document.querySelector(".arrived");
const beginTripBtn = document.querySelector(".beginTrip");
const dropBtn = document.querySelector(".dropoff");
const goOnBtn = document.querySelector(".goOnline");
const goOffBtn = document.querySelector(".goOffline");

async function updateUberDriveState (state) {
    // const response = await fetch(
    //     'https://sandbox-api.uber.com/v1',
    //     {
    //         method: 'POST',
    //         headers: {
    //             authorization: await getAuth(),
    //             'content-type': 'application/json',
    //             'x-uber-organizationuuid': process.env.UBER_ORGANIZATION_ID
    //         },
    //         data: {
    //             run_id: runId,
    //             driver_id: driverId,
    //             driver_state: state
    //         }
    //     }
    // );

    // if(!response.ok){
    //     // show error pop up on window
    //     throw new Error(`Error when calling ${state}: ${response.status}`);
    // }

   response = await fetch(
        '/update',
        {
            method: 'POST',
            headers: {
                authorization: await getAuth(),
                'content-type': 'application/json',
                'x-uber-organizationuuid': process.env.UBER_ORGANIZATION_ID
            },
            data: {
                run_id: runId,
                driver_id: driverId,
                driver_state: state
            }
        }
    );

    driverState.innerHTML = `Current state: ${state}`
    stateUpdatedAt.innerHTML = `State updated at: ${new Date()}`
}

arrBtn.addEventListener("click", (e) => {
    console.log(e);
     updateUberDriveState(SIMULATOR_DRIVER_STATES.arrived).then(()=> {}).catch((e)=> {
        console.log(`err`);
        console.log(e);
     });
})

beginTripBtn.addEventListener("click", (e) => {
    console.log(e);
     updateUberDriveState(SIMULATOR_DRIVER_STATES.beginTrip).then(()=> {}).catch((e)=> {
        console.log(`err`);
        console.log(e);
     });
}) 

dropBtn.addEventListener("click", (e) => {
    console.log(e);
     updateUberDriveState(SIMULATOR_DRIVER_STATES.dropoff).then(()=> {}).catch((e)=> {
        console.log(`err`);
        console.log(e);
     });
})

goOnBtn.addEventListener("click", (e) => {
    console.log(e);
     updateUberDriveState(SIMULATOR_DRIVER_STATES.goOnline).then(()=> {}).catch((e)=> {
        console.log(`err`);
        console.log(e);
     });
})

goOffBtn.addEventListener("click", (e) => {
    console.log(e);
     updateUberDriveState(SIMULATOR_DRIVER_STATES.goOffline).then(()=> {}).catch((e)=> {
        console.log(`err`);
        console.log(e);
     });
})
