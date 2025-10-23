/**
 * Self-adjusting interval to account for drifting
 *
 * @param {function} workFunc  Callback containing the work to be done
 *                             for each interval
 * @param {int}      interval  Interval speed (in milliseconds) - This
 * @param {function} errorFunc (Optional) Callback to run if the drift
 *                             exceeds interval
 */
function AdjustingInterval(workFunc, interval, errorFunc) {
    var that = this;
    var expected, timeout;
    this.interval = interval;

    this.start = function() {
        expected = Date.now() + this.interval;
        timeout = setTimeout(step, this.interval);
    }

    this.stop = function() {
        clearTimeout(timeout);
    }

    function step() {
        var drift = Date.now() - expected;
        if (drift > that.interval) {
            // You could have some default stuff here too...
            if (errorFunc) errorFunc();
        }
        workFunc();
        expected += that.interval;
        timeout = setTimeout(step, Math.max(0, that.interval-drift));
    }
}


function show_para(header) {
  let child_text = header.nextElementSibling;
  child_text.style.display = "block";
}

function toggle_para(header) {
  let child_text = header.nextElementSibling;
  if (child_text.style.display == "none") {
    child_text.style.display = "block";
  } else {
    child_text.style.display = "none";
  }
}

function closeModal(modal) {
  modal.parentElement.parentElement.remove();
}



function randomHeaders() {
  const levelText = document.getElementById('level');
  const streetText = document.getElementById('streetLevel');
  const storageText = document.getElementById('storage');
  const moneyText = document.getElementById('money');


  var randlvl = Math.floor((Math.random() * 50) + 1);
  var randstreet = Math.floor((Math.random() * 50) + 1);
  var randstorage = Math.floor((Math.random() * 280) + 1);
  var randmoney = Math.floor((Math.random() * 9999999) + 1);

  levelText.innerHTML = randlvl + " LEVEL";
  streetText.innerHTML = randstreet + " STREET CRED";
  storageText.innerHTML = `<img class="wrench" height="30" width="30" style="margin: auto 15px;" loading="lazy" src="assets/images/cyberpunk_assets/storage.svg" alt=""></img>` + randstorage + "/280";
  moneyText.innerHTML = `<img class="wrench" height="30" width="30" style="margin: auto 15px;" loading="lazy" src="assets/images/cyberpunk_assets/money.svg" alt=""></img>` + randmoney;
}

randomHeaders();



const text_body = document.getElementById('textBody');



function parse_tsv(tsv) {
  // Split the TSV string into rows
  const rows = tsv.split('\n');

  // Map each row to an array of its tab-separated values
  const array = rows.map(row => row.split('\t'));

  return array;
}

function removeStart(str, remove) {
  remove = String(remove).toUpperCase();
  if (String(str).startsWith(remove)) {
    str = String(str).substring(remove.length);
    str = String(str).substring("<br><br>".length)
    return str;
  }
  return String(str);
}

let category_list = [];
let category_data = [];
const full_shards_list = document.querySelector("#full_shards_list");

function indexed_map(list_of_lists) {
  return Object.fromEntries(
    list_of_lists.map((list, index) => [index, list])
  );
}

async function load_list() {
  var full_shards = parse_tsv(shard_db);

  let count = 0;
  let index = 0;
  full_shards.forEach( rows => {
    if(count == 0) {
      count++;
      return;
    }

    let row_arr = rows.map(row => row.split('\t'));
    if(row_arr.length != 6) {
      count++;
      return;
    }

    let shard_category = String(row_arr[0]).toLowerCase().replaceAll(" ", "_");
    if(!category_list.includes( shard_category )) {
      category_list.push(shard_category);
      category_data.push([shard_category, "", 0]);
      full_shards_list.innerHTML += `<h2 id="${shard_category}_header" class="section_header" onclick="toggle_para(this);">${String(row_arr[0]).toUpperCase()}
      <span id="${shard_category}_num" class="list_num" style="">(0)</span>
				<img class="wrench" height="30" width="30" style="margin: auto 0px auto auto;" loading="lazy" src="assets/images/cyberpunk_assets/cpArrow.svg" alt=""></img>
			</h2>
				<div id="${shard_category}_list" class="section_list" style="display: none;"></div>`;
    };

    let category_header = document.querySelector(`#${shard_category}_list`);
    let shard_title = String(row_arr[1]).replaceAll("'","");

    const result_row = category_data.find(row => row[0] === shard_category);
    result_row[1] += `<h3 data-shard-id="${index}" class="titleBox ${row_arr[5] == "yes" ? "phantom_liberty" : ""} ${row_arr[3] != "" ? "has_audio" : ""}" onclick='display_text(this, "${index}");'>
			<img class="wrench" height="30" width="30" loading="lazy" src="assets/images/cyberpunk_assets/wrench.svg" alt=""></img>
			<span>${String(row_arr[1]).toUpperCase()}</span>
      ${row_arr[3] != "" ? '<img class="wrench" height="30" width="30" style="margin: auto 10px auto auto;" loading="lazy" src="assets/images/cyberpunk_assets/audio_symbol.svg" alt=""></img>' : ""}
		</h3>
    <mob_shard style="display:none;"><div>
    ${row_arr[3] != "" ?
    '<button class="playAudioButtonMob" onclick="event.stopPropagation(); mob_play_audio(this); "><img class="wrench" height="100" width="100" style="margin: auto 0px auto auto; height: 30px; width: 30px;" loading="lazy" src="/assets/images/cyberpunk_assets/play.svg" alt=""></button><button class="playAudioButtonMob" onclick="event.stopPropagation(); mob_reset_audio(); "><img class="wrench" height="100" width="100" style="margin: auto 0px auto auto; height: 30px; width: 30px;" loading="lazy" src="/assets/images/cyberpunk_assets/reset.svg" alt=""></button>' : ""
    }
      <p>${removeStart(row_arr[2], shard_title)}</p>
    </div></mob_shard>`;

    result_row[2]++;
    count++;
    index++;
  });

  // Wait for the next animation frame
  await new Promise(resolve => requestAnimationFrame(resolve));

  category_data.forEach(list => {
    let category_list = document.querySelector(`#${list[0]}_list`);
    let category_num = document.querySelector(`#${list[0]}_num`);
    category_num.innerHTML = `(${String(list[2])})`;
    category_list.innerHTML = list[1];
  });

  const shard_id = parseInt(window.location.hash.replace(/^#/, ''));
  if (shard_id) {
    const selected = document.querySelector(`.titleBox[data-shard-id="${shard_id}"]`);
    display_text(selected, shard_id);
  }

}

load_list();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function display_text(selected, index) {
  window.location.hash = index;
  let full_shards = parse_tsv(shard_db);
  //Clear selected box
  var prev_selected = document.querySelectorAll('.selected.titleBox');
  prev_selected.forEach(function(tab) {tab.classList.remove("selected")});

  //Add selected class to new selected box
  selected.classList.add("selected");
  const shard_map = indexed_map(full_shards);
  const result_row = shard_map[index]
  if (!result_row) {
    console.error(`Row not found for ${title}`);
  }

  //Text display text
  text_body.innerHTML = result_row[2];

  // Make sure that category is expanded for selected item.
  // Mind the previousElementSibling to go from `<div class="section_list` to `<h2 class="section_header`
  const category = selected.closest('.section_list').previousElementSibling;
  show_para(category)

  //Check if there is a audio recording
  let voice_actor = String(result_row[3]).trim();
  if(voice_actor == "") {
    audioSection.style.display = "none";
    hrLine.style.marginTop = "100px";
  } else {
    audioSection.style.display = "flex";
    hrLine.style.marginTop = "0px";
    voiceActor.innerHTML = "Recorded by: " + voice_actor;
    audioElm.setAttribute('src', `/assets/audio/cp_shards/${result_row[4]}.mp3`);
  }

  resetAudio();

  //Only if on mobile view
  if(window.innerWidth <= 900 ) {
    toggle_para(selected);
  }
}

/////////////////////////////////
/////////////////////////////////
//////////////////////////////////
/////////////////////////////////
//AUDIO SECTION

const audioSection = document.getElementById('audioSection');
const hrLine = document.getElementById('redLine1');
const playButton = document.getElementById('playAudioButton');
const playImg = playButton.children[0];
const audioElm = document.getElementById('audioPlayer');
const audioTime = document.getElementById('audioTime');
const voiceActor = document.getElementById('voiceActor');
const audioSeek = document.getElementById('audioSeek');


// Define the work to be done
var doWork = function() {
		audioTime.innerHTML = fancyTimeFormat(audioElm.currentTime) + "/" + fancyTimeFormat(audioElm.duration);
};

// Define what to do if something goes wrong
var doError = function() {
    console.warn('The drift exceeded the interval.');
};

// (The third argument is optional)
var ticker = new AdjustingInterval(doWork, 1000, doError);



var tickerAni = function() {
	audioSeek.value = ((audioElm.currentTime / audioElm.duration) * 100) + 1;
}

var sliderAni = new AdjustingInterval(tickerAni, 100, doError);


function clickSlider() {
	ticker.stop();
	sliderAni.stop();
}

function dropSlider() {
	audioElm.currentTime = (audioSeek.value / 100) * audioElm.duration;
	audioTime.innerHTML = fancyTimeFormat(audioElm.currentTime) + "/" + fancyTimeFormat(audioElm.duration);
	if (audioElm.paused){
		return;
	} else {
		audioElm.play();
		ticker.start();
		sliderAni.start();
	}
}




function playAudio() {
	audioTime.innerHTML = fancyTimeFormat(audioElm.currentTime) + "/" + fancyTimeFormat(audioElm.duration);

	if (audioElm.paused){
		audioElm.play();
		ticker.start();
		sliderAni.start();
		playImg.src = "assets/images/cyberpunk_assets/pause.svg";

	} else {
		audioElm.pause();
		audioTime.innerHTML = fancyTimeFormat(audioElm.currentTime) + "/" + fancyTimeFormat(audioElm.duration);
		ticker.stop();
		sliderAni.stop();
		playImg.src = "assets/images/cyberpunk_assets/play.svg";
	}

}

function audioEnd() {
	audioElm.pause();
	audioTime.innerHTML = fancyTimeFormat(audioElm.currentTime) + "/" + fancyTimeFormat(audioElm.duration);
	ticker.stop();
	sliderAni.stop();
	playImg.src = "assets/images/cyberpunk_assets/play.svg";
}


function resetAudio() {
	audioSeek.value = 1;
	audioElm.pause();
	audioElm.currentTime = 0;
	ticker.stop();
	sliderAni.stop();
	audioTime.innerHTML = fancyTimeFormat(audioElm.currentTime) + "/" + fancyTimeFormat(audioElm.duration);
	playImg.src = "assets/images/cyberpunk_assets/play.svg";
}

function fancyTimeFormat(duration)
{
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}


function mob_play_audio(button) {
  if(audioElm.paused) {
    button.children[0].src = "/assets/images/cyberpunk_assets/pause.svg";
  } else {
    button.children[0].src = "/assets/images/cyberpunk_assets/play.svg";
  }

  playAudio();
}

function mob_reset_audio() {
  resetAudio();
}
