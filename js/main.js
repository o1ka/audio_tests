/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Put variables in global scope to make them available to the browser console.
let audioContext;
var audio = null;
var audio_select_ = null;
var sink_label_ = null;

const constraints = window.constraints = {
  audio: true,
  video: false
};

window.onload = onLoad;

function onLoad() {
  audio = document.querySelector('audio');
  audio_select_ = document.getElementById("audiodevice");
//  audio_select_myaudio = document.getElementById("audiodevice_myaudio");
//  video = document.getElementById("video");
//  myaudio = document.getElementById("myaudio");
  sink_label_ = document.getElementById("sinklabel");
 // sink_label_myaudio = document.getElementById("sinklabel_myaudio");
  //video.play();

  audio_select_.onchange = async => {
    deviceSelected(audioContext, audio_select_, sink_label_)
  };

  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

/*
  navigator.webkitGetUserMedia(
      {audio:true},
      function(stream) {
        refreshDeviceList(true,audio_select_);
   //     refreshDeviceList(true,audio_select_myaudio);
        THESTREAM=stream;
        stream.getAudioTracks()[0].stop();
        console.log("stream closed");
      },
      function(err) {alert(err);}
  );
*/
}

function handleSuccess(stream) {
  const audioTracks = stream.getAudioTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using audio device: ' + audioTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream ended');
  };
  window.stream = stream; // make variable available to browser console
  audio.srcObject = stream;
  audioContext = new AudioContext();
  refreshDeviceList(true,audio_select_, sink_label_);
  var voice = new Audio("voice.m4a");
  voice.loop = true;
  const source = audioContext.createMediaElementSource(voice);
  source.connect(audioContext.destination);
  /*
  const osc = new OscillatorNode(audioContext);
  const amp = new GainNode(audioContext, { gain: 0.03 });
  osc.connect(amp).connect(audioContext.destination);
  osc.start();
  */
  console.log("Playing sound...");
}

function handleError(error) {
  const errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
  document.getElementById('errorMsg').innerText = errorMessage;
  console.log(errorMessage);
}


function refreshDeviceList(selectFirst, audio_select, sink_label) {
  navigator.mediaDevices.enumerateDevices().then( function(infos) {
    var count = 0;
    var curValue = audio_select.options[audio_select.selectedIndex].value;
    var curValueFound = false;
    audio_select.disabled = true;
    audio_select.innerHTML = '';
    const audioOutputs = infos.filter((infos) => infos.kind == "audiooutput");
    console.log(audioOutputs.length)
    for (var i = 0; i < audioOutputs.length; i++) {
      console.log(audioOutputs[i].kind);
      console.log(audioOutputs[i].deviceId);
      console.log(audioOutputs[i].label);
      var option = document.createElement("option");
      option.value = audioOutputs[i].deviceId;
      option.text = audioOutputs[i].label;
      count++;
      option.text = '' + (count) + ' - ' + option.text + ' ' + audioOutputs[i].kind;
      audio_select.appendChild(option);
      if (option.value == curValue) {
        curValueFound = true;
      }
    }
    audio_select.disabled = false;
    if (selectFirst) {
      console.log("selectFirst");
      deviceSelected(audioContext, audio_select, sink_label);
    } else if (curValueFound) {
      audio_select.value = curValue;
    }
  }, function(msg) {
    alert('Something wrong: ' + msg);
  });
}

function deviceSelected(elem, audio_select, sink_label) {
  var deviceId = null;
  if (audio_select.options.length > 0) {
    deviceId = audio_select.options[audio_select.selectedIndex].value;
    var promise = elem.setSinkId(deviceIdToSinkId(deviceId));
    promise.then(function(result) {
      sink_label.innerHTML = 'AudioContext output device sink ID is ' + elem.sinkId;
    }, function(e) {
      sink_label.innerHTML = 'AudioContext output device could not be set: ' + e.name + ' - ' + e.message;
    });
  } else {
    alert("No audio devices found");
  }
}

function deviceIdToSinkId(deviceId) {
  if (deviceId === "default") return "";
  if (deviceId === "silent") return { type: "none" };
  return deviceId;
}



/*


changeOutputButton.onclick = async () => {
  const sinkId = deviceIdToSinkId(devicesDropdown.value);
  await audioContext.setSinkId(sinkId);
  if ('getSinkId' in audioContext) {
  console.log(`audioContext.getSinkId() = ${JSON.stringify(audioContext.getSinkId())}`);
  } else {
  console.log(`audioContext.sinkId = ${JSON.stringify(audioContext.sinkId)}`);
  }
};

getAudioOutputsButton.onclick = async () => {
  console.log("getAudioOutputsButton");

  try {
    // More audio outputs are available when user grants access to the microphone.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
  } finally {
    populateDropdown();
    if (!audioContext) playSound();
  }
};

async function populateDropdown() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioOutputs = devices.filter((device) => device.kind == "audiooutput");
  console.log("populateDropdown");

  devicesDropdown.innerHTML =
    audioOutputs.map((device) => createOption(device)).join("") +
    createOption({ deviceId: "silent", label: "No output" });
  devicesDropdown.disabled = false;
  changeOutputButton.disabled = false;
}

function playSound() {
  audioContext = new AudioContext();
  const osc = new OscillatorNode(audioContext);
  const amp = new GainNode(audioContext, { gain: 0.03 });
  osc.connect(amp).connect(audioContext.destination);
  osc.start();
  console.log("Playing sound...");
}

// Utils

function deviceIdToSinkId(deviceId) {
  if (deviceId === "default") return "";
  if (deviceId === "silent") return { type: "none" };
  return deviceId;
}


function log(text) {
  logs.textContent += `${text}\r\n`;
}


function createOption({ deviceId, label }) {
  return `<option value="${deviceId}">${label || "Default"}</option>`;
}

});

*/
