// Software for the browser-based application for mdeyo automated track timing project

/////////////////////////// Variables Section Start /////////////////////////////

// saved_ids is the main data structure for matching incoming scan IDs with
// the athletes that were added though the interface
var saved_ids = {};

// Different flags used by async server connection
// These might not work as designed if >1 users connected to the app

// Requesting a start time for a specific athlete timer
// This strategy might not work if delay in getting time and many athletes clicked
var requesting_time_id = null;
var requesting_time_flag = false;

// Requesting a start time for a specific group timer - less chance of concurrency issues
// Might limit user to only start group timers, instead of indiv athletes
var requesting_group_time_id = null;
var requesting_group_time_flag = false;

var next_name = null;
var next_name_flag = false;

var total_t = 0

var active_clocks = {};
var upload_data;

var config_input;
var has_jquery = true;

var athlete_timers;
var id_increment = 0;

var group_options = {}

start_time = 0
var main_start_time;

var runner_count = 0;
var runner_count_text;
var saved_groups = {};

var use_socket = true; //can be false when debugging

/////////////////////////// Variables Section End /////////////////////////////

////////////////////// Debugging variables Section Start //////////////////////

// override socket while debugging without the full system
use_socket = false;

// TODO temporary for MIT XC time trial //
var time_trial = {
  "E20060081309009420803DC2": {
    "name": "1",
    "created_at": "10:05:00 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E20060081309009419404A38": {
    "name": "2",
    "created_at": "10:08:42 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E2006008130900941350895F": {
    "name": "3",
    "created_at": "10:08:51 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E2006008130900942000460B": {
    "name": "4",
    "created_at": "10:08:58 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E2006008130900941450809B": {
    "name": "5",
    "created_at": "10:09:05 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E2005186010701841040ACE4": {
    "name": "6",
    "created_at": "10:09:34 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E20060081309009417006427": {
    "name": "7",
    "created_at": "10:10:04 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E2006008130900941600714B": {
    "name": "8",
    "created_at": "10:10:12 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E20060081309009417605FCA": {
    "name": "9",
    "created_at": "10:10:25 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E20060081309009416906653": {
    "name": "10",
    "created_at": "10:10:38 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E20060081309009415906F1F": {
    "name": "11",
    "created_at": "10:11:54 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E200600813090094183054ED": {
    "name": "12",
    "created_at": "10:12:01 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E20060081309009418405702": {
    "name": "13",
    "created_at": "10:12:10 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E20060081309009419304C5C": {
    "name": "14",
    "created_at": "10:12:17 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E200600813090094199043F7": {
    "name": "15",
    "created_at": "10:12:23 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E200600813090094217033CB": {
    "name": "16",
    "created_at": "10:12:30 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E20060081309009420703BCD": {
    "name": "17",
    "created_at": "10:12:36 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E20060081309009422402E09": {
    "name": "18",
    "created_at": "10:12:43 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E200600813090094218031D7": {
    "name": "19",
    "created_at": "10:12:49 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  },
  "E20060081309009422302C2D": {
    "name": "20",
    "created_at": "10:12:57 PM-8/24/2017",
    "name_text": {},
    "start_button": {},
    "timer_text": {}
  }
}
// TODO temporary for MIT XC time trial //
saved_ids = time_trial;

////////////////////// Debugging variables Section End ////////////////////////

// TODO - need to be able to save a saved_id  json or at least the laps data in a nice format

// TODO - need to be able to import and load a previous set of athletes and groups for the
// case where a team of athletes keeps there reusable tags and always uses the same one

// TODO - need to handle moving athletes between groups, right now we are looking at
// adding an athlete to a group when selected, but not removing from previous groups

// If new ID registered -> set next_name_flag false
function registerTag(id) {
  if (id in saved_ids) {
    console.log('id:' + id + ' already registered as: ' + saved_ids[id].name);
    next_name_flag = false;
  } else {
    addTagID(id);
  }
}

function resetLaps() {
  for (var id in saved_ids) {
    saved_ids[id].laps = [];
    saved_ids[id].lap_count = 0;
  }
}

function addTimingButton(id) {
  id_increment += 1;

  var new_div = document.createElement('div');
  new_div.id = 'div_' + id;
  new_div.className = "registered_athletes";

  var new_name = document.createElement('p');
  saved_ids[id].name_text = new_name;
  new_name.innerHTML = saved_ids[id].name;
  new_name.id = 'name_' + id;
  new_name.addEventListener("dblclick", function() {
    rename_id(id);
  }, false);

  var new_group = document.createElement('select');
  new_group.className = 'group_select'
  new_group_id = "group_select_" + id_increment.toString();
  saved_ids[id].group_select_id = new_group_id;
  new_group.id = new_group_id;
  new_group.addEventListener("change", function() {
    // rename_id(id);
    console.log('hello change');
    // add_to_group(this);
    saved_ids[id].group = this.value;
    saved_groups[this.value].athletes.push(id);
    console.log(this);
  }, false);

  var new_button = document.createElement("button");
  saved_ids[id].start_button = new_button;
  new_button.innerHTML = 'Start Timing';
  new_button.id = 'start_button_' + id;

  new_button.addEventListener("click", function() {
    request_time_id(id);
  }, false);

  var new_timer = document.createElement("p");
  saved_ids[id].timer_text = new_timer;
  new_timer.innerHTML = '0';
  new_timer.id = 'timer_' + id;
  new_timer.className = "timer";

  new_div.append(new_name);
  new_div.append(new_group);
  // new_div.append(new_button);
  new_div.append(new_timer);
  athlete_timers.append(new_div);

  console.log(saved_ids);
  console.log(saved_ids[id]);
  update_this_group_options(id);

}

// var jsonData = JSON.stringify(data);

function download(text, name, type) {
  var a = document.createElement("a");
  var file = new Blob([text], {type: type});
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
}
// download(jsonData, 'test.txt', 'text/plain');

function rename_id(id) {
  var name = prompt("Please enter new name", "Harry Potter");
  if (name != null) {
    saved_ids[id].name = name;
    saved_ids[id].name_text.innerHTML = name;
  }
}

function counting_func() {
  total_t = total_t + 1;
  console.log(total_t);
}

function init() {

  runner_count_text = document.getElementById('runner-count-text');
  reset_runner_count();

  resetLaps();

  // main_timer_text = document.getElementById('timer-text');
  athlete_timers = document.getElementById('athlete_timers');
  // setInterval(counting_func, 1000);
  var start = new Date;

  setInterval(function() {
    update_clocks(new Date);
    if (has_jquery) {
      try {
        $('Timer').text((new Date - start) / 1000 + " Seconds");
      } catch (err) {
        console.log('no jquery found :(');
        has_jquery = false;
      }
    }
  }, 1000);

  config_input = document.getElementById('config-input');
  config_input.addEventListener("input", function() {
    console.log('input changed!!');
  }, false);
  config_input.addEventListener("change", function() {
    console.log('changes!!');
    var file = config_input.files[0];
    if (file) {
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function(evt) {
        console.log(evt.target.result);
        upload_data = evt.target.result;
        // document.getElementById("fileContents").innerHTML = evt.target.result;
      }
      reader.onerror = function(evt) {
        console.log("error reading file");
        // document.getElementById("fileContents").innerHTML = "error reading file";
      }
    }

  }, false);
}

function use_upload_data(data) {
  console.log('TODO');
}

function start_timer(id) {
  saved_ids[id].client_start_time = new Date;
  saved_ids[id].active = true;
}

// var main_timer_text;

function convert_to_minutes(seconds) {
  if (seconds >= 60) {
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;
    if (sec > 9) {
      sec = sec.toString();
    } else {
      sec = "0" + sec.toString();
    }
    return min.toString() + ':' + sec;
  } else {
    return seconds.toString()
  }
}

function update_clocks() {
  var date = new Date;
  // main_timer_text.innerHTML = convert_to_minutes(Math.floor((date - main_start_time) / 1000));

  for (var id in saved_ids) {
    // if (saved_ids[id].active) {
    saved_ids[id].timer_text.innerHTML = Math.floor((date - saved_ids[id].client_start_time) / 1000);
    // }
  }

  for (var id in saved_groups) {
    if (saved_groups[id].client_start_time && saved_groups[id].active) {
      saved_groups[id].timer_text.innerHTML = Math.floor((date - saved_groups[id].client_start_time) / 1000);
    }
  }
}

function add_group() {
  var name_input = document.getElementById('group_name');
  var group_name = name_input.value;

  if (group_name == "" || group_name == " ") {
    console.log("Invalid group name")
  } else {

    if (group_name in group_options) {
      console.log('Already have group: ' + group_name + ' as an option');
    } else {

      saved_groups[group_name] = {}
      saved_groups[group_name].athletes = [];
      saved_groups[group_name].active = false;

      group_options[group_name] = 0;
      console.log('Added group: ' + group_name);

      update_group_options();

      var new_div = document.createElement('div');
      new_div.id = 'div_' + group_name;
      new_div.className = "registered_groups";

      var new_name = document.createElement('p');
      new_name.innerHTML = group_name;
      new_name.className = "group_name";

      var new_distance = document.createElement('select');
      new_distance.className = 'distance_select';
      new_distance.innerHTML = "<option selected='selected'>400</option> <option>800</option> <option>1200</option> <option>1600</option>";

      new_distance.addEventListener("change", function() {
        // rename_id(id);
        console.log(this.value);
      }, false);

      var new_button = document.createElement("button");
      // saved_ids[id].start_button = new_button;
      new_button.innerHTML = 'Start Timing';
      new_button.id = 'start_button_' + group_name;
      new_button.addEventListener("click", function() {
        request_group_time(group_name);
      }, false);
      saved_groups[group_name].timer_buttion = new_button;

      var new_timer = document.createElement("p");
      saved_groups[group_name].timer_text = new_timer;
      new_timer.innerHTML = '0';
      new_timer.id = 'timer_' + group_name;
      new_timer.className = "group_name";

      new_div.append(new_name);
      new_div.append(new_distance);
      new_div.append(new_button);
      new_div.append(new_timer);
      var group_timers = document.getElementById('group_timers');
      group_timers.append(new_div);
    }
  }
}

function update_this_group_options(id) {

  if (saved_ids[id].group_select_id) {

    var select_menu = $("#" + saved_ids[id].group_select_id);
    var previous_value = null;

    if (select_menu.val()) {
      previous_value = select_menu.val();
    }
    console.log(select_menu);
    select_menu.empty();
    select_menu.append($('<option></option>').attr("value", "None").text("None"));

    console.log(id + ' has a group select to update');

    for (group_name in group_options) {
      select_menu.append($('<option></option>').attr("value", group_name).text(group_name));
    }

    if (previous_value) {
      select_menu[0].value = previous_value;
    }

  }

}

function update_group_options() {

  for (var id in saved_ids) {
    update_this_group_options(id);
  }

}

function addTagID(id) {
  if (id in saved_ids) {
    console.log('id:' + id + ' already registered as: ' + saved_ids[id].name);
  } else {
    var new_tag_name;
    if (next_name_flag) {
      new_tag_name = next_name;
      next_name_flag = false;
    } else {
      new_tag_name = 'unknown';
    }
    var d = new Date();
    // alert(d);                        // -> Sat Feb 28 2004 23:45:26 GMT-0300 (BRT)
    // alert(d.toLocaleString());       // -> Sat Feb 28 23:45:26 2004
    var timestamp = d.toLocaleTimeString() + '-' + d.toLocaleDateString();
    saved_ids[id] = {
      'name': new_tag_name,
      'created_at': timestamp
    };
    console.log('New id:' + id + ' now registered as: ' + saved_ids[id].name);
    addTimingButton(id);
  }
}

function setTagName(id, name) {
  if (id in saved_ids) {
    saved_ids[id].name = name;
    console.log('Updated id:' + id + ' updated with name: ' + saved_ids[id].name);
  } else {
    console.error('ID:' + id + ' not registered');
  }
}

// connect socket to server
//var socket = io.connect('http://localhost:3000');
var socket = io.connect('192.168.42.1:8080');
socket.on('connect', function() {
  clear_console();
  add_console_msg('green', 'Connected to the MultiMaster Server!');
});
socket.on('disconnect', function() {
  clear_console();
  add_console_msg('red', 'Disconnected from the MultiMaster Server!');
});

start_time = 0
var main_start_time;

var runner_count = 0;
var runner_count_text;


//////////////////////////////////////////////////////////
/////////////////////
////////////////////////////////////////////////////////////
////////////////////


function increment_runner_count() {
  runner_count += 1;
  runner_count_text.innerHTML = runner_count;
}

function reset_runner_count() {
  runner_count = 0;
  runner_count_text.innerHTML = runner_count;
}



/////////////////////////////
/// Socket code section /////
/////////////////////////////

if (use_socket) {
  // connect socket to server
  var socket = io.connect('http://localhost:3000');
  var socket = io.connect('127.0.01:3000');
  socket.on('connect', function() {
    clear_console();
    add_console_msg('green', 'Connected to the MultiMaster Server!');
  });
  socket.on('disconnect', function() {
    clear_console();
    add_console_msg('red', 'Disconnected from the MultiMaster Server!');
  });

  socket.on('reply', function(data) {
    console.log('reply:' + data);
    start_time = parseFloat(data);
    main_start_time = new Date;

    if (requesting_time_flag) {
      requesting_time_flag = false;
      saved_ids[requesting_time_id].start_time = start_time;
    }

    if (requesting_group_time_flag) {
      requesting_group_time_flag = false;
      saved_groups[requesting_group_time_id].start_time = start_time;
      update_group_athlete_timers(requesting_group_time_id);
    }
  });

  socket.on('scan-id', function(data) {
    pause_scan();
    console.log('got scan-id:' + data);
    registerTag(data);
  });

  socket.on('scanning', function(data) {
    console.log('Scanning status: ' + data);
  })

  socket.on('result', function(data) {
    console.log('result:' + data);
    var strings = data.split(':');
    var id = strings[0];
    var timestamp = parseFloat(strings[1]);
    console.log('Name: ' + saved_ids[id].name + " timestamp: " + timestamp.toString());

    if (id in saved_ids) {
      var lap_time = (timestamp - saved_ids[id].start_time);
      console.log('Lap time: ' + (lap_time).toString());
      saved_ids[id].laps.push(lap_time);
      saved_ids[id].lap_count += 1;
      increment_runner_count();
    }
  });

  // listen to update event raised by the server
  socket.on('update', function(data) {
    console.log(data);
    update_computers(data);
    // make sure object still has all the required structures
    if (data.computers && data.topics && data.services) {
      console.log('correct data format');
    } else if (data.type == 'green' || data.type == 'red') {
      add_console_msg(data.type, data.message);
    } else if (data.type == 'topic-names') {
      update_rostopic_dropdowns(data);
    } else if (data.type == 'route-status') {
      console.log('route-status update!');
      update_rostopic_status(data);
    }
    // response to the server-noteside
    // maybe success or failure message?
    response = 'success'
    //  socket.emit('update-response', response); // raise an event on the server
  });
}

function check_socket(failure_message) {
  if (socket) {
    return true;
  } else {
    console.log("No socket - " + failure_message);
  }

}

function resume_scan() {
  if (check_socket("cannot resume scan")) {
    socket.emit('update', 'resume');
  }
}

function pause_scan() {
  if (check_socket("cannot pause scan")) {
    socket.emit('update', 'pause');
  }
}

function stop_scan() {
  if (check_socket("cannot stop scan")) {
    socket.emit('update', 'stop');
  }
}

function request_time() {
  if (check_socket("cannot request timestamp")) {
    socket.emit('request', 'timestamp');
  }
}

// Called by each athlete start timer button, sets flag to true and updates the
// start time for athlete with id
function request_time_id(id) {
  requesting_time_flag = true;
  requesting_time_id = id;
  if (check_socket("cannot request timestamp")) {

    socket.emit('request', 'timestamp');
  }
  start_timer(id);
}

function request_group_time(group_name) {
  if (saved_groups[group_name].active){
    console.log('TODO feature to stop group timer');
    saved_groups[group_name].active = false;
    saved_groups[group_name].timer_buttion.innerHTML = "Start Timing"
  }else{
    start_group_time(group_name);
    saved_groups[group_name].active = true;
    saved_groups[group_name].timer_buttion.innerHTML = "Stop Timing"
  }
}

function start_group_time(group_name){
  requesting_group_time_flag = true;
  requesting_group_time_id = group_name;
  if (check_socket("cannot request group timestamp")) {
    socket.emit('request', 'timestamp');
  }
  console.log('updating time: ' + group_name);
  saved_groups[group_name].client_start_time = new Date();
  update_group_athlete_timers(group_name);
}

// Go through and update each athlete start time for athletes in this group
// Updates both client/browser time and the hardware (more accurate?) time stamps
// Called after user starts group timer and again when time recieved from hardware
function update_group_athlete_timers(group_name) {
  var new_client_start = saved_groups[group_name].client_start_time;
  var new_hardware_start = saved_groups[group_name].start_time;

  for (i in saved_groups[group_name].athletes) {
    var athlete_id = saved_groups[group_name].athletes[i];
    console.log('updating group athlete timer: ' + athlete_id);
    saved_ids[athlete_id].client_start_time = new_client_start;
    saved_ids[athlete_id].start_time = new_hardware_start;
  }
}


// Not used yet - idea was for 'Add Tag' button to open an interface that prompts athlete name first
function name_for_next_scan_for_id(name) {
  next_name_flag = true;
  next_name = name;
  resume_scan();
  if (check_socket("cannot request ID scan")) {
    socket.emit('request', 'scan-id');
  }
}

// Called when user presses "Add Tag" button
// Adds athlete to interface once ID reieved from the hardware
function scan_for_id() {
  resume_scan();
  if (check_socket("cannot request ID scan")) {
    socket.emit('request', 'scan-id');
  }
}
