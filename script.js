const API_BASE = "http://localhost:8080/api/v1/vacuum";
const POLL_MS = 5000;
const $ = s => document.querySelector(s);
const now = () => new Date().toLocaleTimeString();

async function fetchStatus(){
  try {
    const res = await fetch(`${API_BASE}/status`);
    const data = await res.json();
    updateStatus(data);
  } catch {
    updateStatus({name:"—",status:"Offline",batteryPercent:60,bluetoothConnected:false});
  }
}

function updateStatus(d){
  $("#device-name").textContent = d.name;
  $("#device-status").textContent = d.status;
  $("#device-bluetooth").textContent = d.bluetoothConnected ? "Connected" : "Disconnected";
  $("#batteryPercentText").textContent = d.batteryPercent + "%";
  $("#batteryFill").style.width = d.batteryPercent + "%";
}

async function fetchActivities(){
  try {
    const res = await fetch(`${API_BASE}/activities`);
    const list = await res.json();
    const wrap = $("#activityList");
    wrap.innerHTML = "";
    if(list.length === 0){
      wrap.innerHTML = `<div class='act empty'>No activities yet.</div>`;
    } else {
      list.reverse().forEach(i=>{
        const e=document.createElement("div");
        e.className="act";
        e.textContent=`${i.type} — ${i.details}`;
        wrap.appendChild(e);
      });
    }
  } catch { console.log("Activity fetch failed"); }
}

async function sendCommand(cmd){
  await fetch(`${API_BASE}/command/${cmd}`,{method:"POST"});
  fetchStatus(); fetchActivities();
}

$("#btnStart").onclick=()=>sendCommand("start");
$("#btnPause").onclick=()=>sendCommand("pause");
$("#btnStop").onclick=()=>sendCommand("stop");
$("#btnDock").onclick=()=>sendCommand("return");
$("#btnLocate").onclick=()=>sendCommand("locate");

$("#assistantSend").onclick=()=>{
  const val=$("#assistantInput").value.trim().toLowerCase();
  $("#assistantResponse").textContent="Processing...";
  sendCommand(val.includes("start")?"start":
              val.includes("pause")?"pause":
              val.includes("stop")?"stop":
              val.includes("return")?"return":
              val.includes("locate")?"locate":"");
  $("#assistantResponse").textContent=`Sent command: ${val}`;
  $("#assistantInput").value="";
};

fetchStatus();
fetchActivities();
setInterval(()=>{fetchStatus();fetchActivities();},POLL_MS);
