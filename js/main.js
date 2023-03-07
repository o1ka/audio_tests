/* some scrappy code to make it work */

'use strict';

// Put variables in global scope to make them available to the browser console.
let audioContext;
var audio = null;
var audio_no_aec = null;
var audio_select_ = null;
var sink_label_ = null;
var mic_label = null;

window.onload = onLoad;

function onLoad() {
  audio = document.getElementById('gum-local');
  audio_no_aec = document.getElementById('gum-local-noaec');
  audio_select_ = document.getElementById("audiodevice");
  sink_label_ = document.getElementById("sinklabel");
  mic_label = document.getElementById("miclabel");


  audio_select_.onchange = async => {
    deviceSelected(audioContext, audio_select_, sink_label_)
  };

  navigator.mediaDevices.getUserMedia( {audio: true, video: false} ).then(handleSuccess).catch(handleError);
  navigator.mediaDevices.getUserMedia( {audio: { echoCancellation: false }, video: false} ).then(handleSuccessNoAec).catch(handleError);
}

function handleSuccess(stream) {
  const audioTracks = stream.getAudioTracks();
  console.log('Using audio device: ' + audioTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream ended');
  };
  audio.srcObject = stream;
  console.log("Playing sound...");

  audioContext = new AudioContext();
  refreshDeviceList(true,audio_select_, sink_label_);
  var voice = new Audio("voice.m4a");
  voice.loop = true;
  const source = audioContext.createMediaElementSource(voice);
  source.connect(audioContext.destination);
  voice.play();

  console.log("Playing WebAudio voice...");
}

function handleSuccessNoAec(stream) {
  const audioTracks = stream.getAudioTracks();
  console.log('Using audio device: ' + audioTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream ended');
  };
  audio_no_aec.srcObject = stream;
  console.log("Playing sound no aec...");
}

function handleError(error) {
  const errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
  document.getElementById('errorMsg').innerText = errorMessage;
  console.log(errorMessage);
}


function refreshDeviceList(selectFirst, audio_select, sink_label) {
  navigator.mediaDevices.enumerateDevices().then( function(infos) {
    /*
    const defaultAudioInput = infos.filter((infos) => infos.kind == "audioinput" && infos.deviceId == "default");
    mic_label.innerHTML = 'Microphne: ' + defaultAudioInput.label;
    */
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
    var option_silent = document.createElement("option");
    option_silent.value = "silent";
    option_silent.text = "No output";
    audio_select.appendChild(option_silent);
    if (option_silent.value == curValue) {
      curValueFound = true;
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
  // if (deviceId === "default") return "";
  if (deviceId === "silent") return { type: "none" };
  return deviceId;
}



