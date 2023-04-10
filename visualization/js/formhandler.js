updateSliderParticipants();
updateSliderSpeed('rSpeed');

function updateSliderParticipants(){
	let value = document.getElementById('participants').value;

	document.getElementById('participantAmt').innerHTML = value;

	document.getElementById('avgRes').innerHTML = 50000 / value;

}

function updateSliderSpeed(id){
	let value = document.getElementById(id).value;

	document.getElementById(id + 'Amt').innerHTML = value + "%";

	let s = ((2000 * (100-value) * .01)+10)/1000;

	document.getElementById('millis').innerHTML = s;
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
