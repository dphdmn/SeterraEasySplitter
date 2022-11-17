// ==UserScript==
// @name         SES: Seterra easy splitter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  keep track of your progress!
// @author       dphdmn
// @match        https://www.geoguessr.com/seterra/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
(function() {
	'use strict';

	console.log(GM_getValue("egg"))
	var mycss = ".table{margin:0 0 40px;width:100%;box-shadow:0 1px 3px rgba(0,0,0,.2);display:table}.row{display:table-row;background:#f6f6f6}.row:nth-of-type(odd){background:#e9e9e9}.row:first-child{font-weight:900;color:#fff;background:#1f7a7d}.row.green{background:#27ae60}.row.blue{background:#2980b9}.cell{padding:6px 12px;display:table-cell}@media screen and (max-width:580px){.table{display:block}.row{padding:14px 0 7px;display:block}.row.header{padding:0;height:6px}.row.header .cell{display:none}.row .cell{margin-bottom:10px}.row .cell:before{margin-bottom:3px;content:attr(data-title);min-width:98px;font-size:10px;line-height:10px;font-weight:700;text-transform:uppercase;color:#969696;display:block}.cell{padding:2px 16px;display:block}}";
	var style = document.createElement('style');
	style.innerHTML = mycss;
	document.head.appendChild(style);
	var my_correct = 0;
	var lastTask = qText;
	var curTask;
	var mytime;
	var mylog = [];
	var mytimes = [];
	var tbl;
	var dif;
	var t;
	var saved = "";
	var pbs = [];
	var colors = [];
	var difs = [];
	var gameSave;
	var pbisdef;
	var pbsplit;
	var pbsplittext;
	var resetbutton;
	var mytimestring;
	var pbinfo;
	var pluschar;
	var savePBs = false;
	resetbutton = document.createElement("button");
	resetbutton.type = "button";
	resetbutton.innerHTML = 'Reset PB splits for that gamemode';
	resetbutton.onclick = function() {
		GM_setValue(gameSave, undefined);
		alert("Your PBs very successfully removed from the Earth! (for this mode only, don't worry)");
	};
	const headers = ["N", "Time", "PB split", "Score", "Task"]
	mylog.push(headers)
	const container = document.getElementById('gameselect');
	const statsDiv = document.createElement('div');
	container.appendChild(statsDiv)
	addEventListener('click', (event) => {
		if (correctClicks == 0) {
			statsDiv.innerHTML = "";
			my_correct = 0;
			lastTask = qText;
			mylog = [];
			pbs = [];
			mytimes = [];
			colors = [];
			difs = [];
			mylog.push(headers)
		}
		if (correctClicks == 1) {
			gameSave = gameMode + window.location.href;
			//GM_setValue(gameSave, undefined);
			pbs = GM_getValue(gameSave)
			pbisdef = (pbs !== undefined);
		}
		if (correctClicks > my_correct) {
			my_correct = correctClicks;
			curTask = lastTask;
			lastTask = qText;
			t = gameDuration;
			mytime = t / 1000;
			mytimes.push(t);

			if (!pbisdef) {
				pbsplit = "-";
				pbsplittext = pbsplit;
				colors.push("Green");
				mytimestring = mytime.toString();
			} else {
				pbsplit = pbs[correctClicks - 1];
				dif = t - pbsplit;
				difs.push(dif);
				if (dif > 0) {
					pluschar = "+";
					colors.push("Red");
				} else {
					pluschar = "";
					colors.push("Green");
				}
				pbsplittext = (pbsplit / 1000).toString();
				mytimestring = mytime.toString() + " (" + pluschar + (dif / 1000).toString() + ")";
			}
			mylog.push([correctClicks.toString(), mytimestring, pbsplittext, score.toString() + "%", curTask]);
			if (questionCount == correctClicks) {
				tbl = document.createElement('div');
				savePBs = false;
				if (score == 100) {
					if (!pbisdef) {
						savePBs = true;
					} else {
						if (pbs.slice(-1)[0] > mytimes.slice(-1)[0]) {
							savePBs = true;
						}
					}
				}
				saved = "No PB. (keep in mind that each gamemode and ?atribute is differnt PB, also only 100% will be saved)";
				if (savePBs) {
					saved = "New PB!";
					GM_setValue(gameSave, mytimes);
				}
				statsDiv.appendChild(resetbutton);
				statsDiv.appendChild(document.createElement("br"));
				//statsDiv.appendChild(document.createTextNode("GameTypeID: " + gameSave));
				//statsDiv.appendChild(document.createElement("br"));
				//statsDiv.appendChild(document.createTextNode("(different for any gamemode and ?things after url)"));
				// statsDiv.appendChild(document.createElement("br"));
				pbinfo = document.createElement("p");
				statsDiv.appendChild(pbinfo);
				pbinfo.style.textAlign = "center";
				if (savePBs) {
					pbinfo.style.color = "Blue";
				}
				pbinfo.appendChild(document.createTextNode(saved));
				statsDiv.classList.add("table");
				tbl.classList.add("table");
				mylog.forEach((row, rowindex) => {
					const tr = document.createElement('div');
					tr.classList.add("row");
					tbl.appendChild(tr);
					row.forEach((cell, cellindex) => {
						const td = document.createElement('div');
						if (cellindex == 1 && rowindex > 0) {
							td.style.color = colors[rowindex - 1];
						}
						td.classList.add("cell");
						tr.appendChild(td);
						td.appendChild(document.createTextNode(cell));
					});
				});
				statsDiv.appendChild(tbl);
			}
		}
	});
})();
