const networkList = 'data/conEdNetworks2022-cleaned.csv'
let parsedNetworkedList

updateSliderParticipants();
updateSliderReservation();
updateSliderSpeed('rSpeed');

function updateSliderParticipants(){
	let value = document.getElementById('participants').value;

	document.getElementById('participantAmt').innerHTML = value;

	updateAvgReservation();
}

function updateSliderReservation(){
	let value = document.getElementById('reservation').value;

	document.getElementById('reservationAmt').innerHTML = value;

	updateAvgReservation();
}

function updateAvgReservation(){
		let p = document.getElementById('participants').value;
		let r = document.getElementById('reservation').value;

	document.getElementById('avgRes').innerHTML = (Math.round((r / p)*100)) /100;
}

function updateSliderSpeed(id){

	let value = document.getElementById(id).value;

	document.getElementById(id + 'Amt').innerHTML = value + "%";

	let s = ((2000 * (100-value) * .01)+10)/1000;

	document.getElementById('millis').innerHTML = s;
}

function populateNetworkList(networkArray){

	const dropdownMenu = document.getElementById('networks'); // Get the dropdown menu element
	for(let n = 0; n < networkArray.length; n++){
		  let newItem = document.createElement('option'); // Create a new option element
		  newItem.textContent = networkArray[n].network + ', ' + networkArray[n].borough; // Set the text content of the new option element
		  newItem.value = networkArray[n].network; // Set the value of the new option element
		  dropdownMenu.add(newItem); // Add the new option element to the dropdown menu
	}
}

function updateNetwork(){
	const dropdownMenu = document.getElementById('networks'); // Get the dropdown menu element

	//const t2 = ["borough hall", "central bronx", "fordham", "northeast bronx", "ocean parkway", "ridgewood", "southeast bronx", "west bronx", "williamsburg", "jackson heights"]

	let nName, nBorough, nTier;

	for(let n = 0; n < parsedNetworkedList.length; n++){
		if(parsedNetworkedList[n].network == dropdownMenu.value){
			 nName = parsedNetworkedList[n].network;
			 nBorough = parsedNetworkedList[n].borough;
			 nTier = parsedNetworkedList[n]["tier"];
			break;
		}
	}

	let csrpRes, csrpPart, dlrpRes, dlrpPart

	if (nTier == 1){
		dlrpRes = 18;
	} else {
		dlrpRes = 25;
	}

	if(['westchester','staten island'].includes(nBorough)){
		csrpRes = 6;
	} else {
		csrpRes = 18;
	}

	let p = document.getElementById('participants').value;
	let r = document.getElementById('reservation').value;
	const annualIncome = ((5 * csrpRes) + (5 * dlrpRes)) * (r/p)
	document.getElementById('networkInfo').innerHTML = nName + ", " + nBorough + " is a tier " + nTier + " network. It's CSRP reservation rate is $" + csrpRes + "/kW-month and its DLRP reservation rate is $" + dlrpRes + "/kW-month. With full participation, the total annual reservation income at the average kW determined above would be $" + annualIncome + "."
}
/*
function onSubmit(event) {
  console.log(`Form Submitted! Timestamp: ${event.timeStamp}`);

  let q = 'http://localhost:8000/visualization/network.html?';

  if(true){
  	q = q + '&crsp=true'
  }

  if(true){
  	q = q + '&dlrp=true'
  }

  console.log(q);

  event.preventDefault();


	// Simulate an HTTP redirect:
	window.location.replace(q);
}

const form = document.getElementById("modelSettings");

form.addEventListener("submit", onSubmit);*/

function readCSVFile(file) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', file, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const csvData = xhr.responseText;
          const lines = csvData.split('\n');
          const result = [];
          let headers = lines[0].split(',');
          for (let j = 0; j < lines[0].split(',').length; j++) {
          	headers[j]= headers[j].replace('\r','');
          }
          for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentLine = lines[i].split(',');
            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentLine[j].replace('\r','');
            }
            result.push(obj);
          }
          resolve(result);
        } else {
          reject(new Error(`Failed to load CSV file. Status: ${xhr.status}`));
        }
      }
    };
    xhr.onerror = (error) => {
      reject(error);
    };
    xhr.send();
  });
}

readCSVFile(networkList)
  .then((data) => {
    parsedNetworkedList = data
    console.log(parsedNetworkedList); // Log the parsed CSV data
    populateNetworkList(parsedNetworkedList)
  })
  .catch((error) => {
    console.error(`Error while reading CSV file: ${error.message}`); // Log the error message
  });
