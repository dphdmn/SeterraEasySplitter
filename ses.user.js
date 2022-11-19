// ==UserScript==
// @name SES: Seterra easy splitter
// @namespace http://tampermonkey.net/
// @version 1.5
// @description keep track of your progress!
// @author dphdmn
// @match https://www.geoguessr.com/seterra/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant GM_setValue
// @grant GM_getValue
// @require https://cdn.jsdelivr.net/npm/chart.js
// @require https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-zoom/1.2.1/chartjs-plugin-zoom.min.js
// ==/UserScript==
function handleSpeed(splits, smooth) {
    var subsum;
    var subam;
    var results = []
    splits.forEach((_, index) => {
        subsum = 0;
        subam = 0;
        for (var i = index; index - i <= smooth; i--) {
            if (i < 0) {
                break;
            }
            subsum += splits[i];
            subam += 1;
        }
        results.push(subam / subsum);
    });
    return results;
}
function setHistoryData(historyData, checkdata) {
    var result = [];
    var todaydate = (new Date()).toJSON().slice(0, 10);
    result.push({
        data: historyData.map(function (item) {
            if (item.PB && (checkdata == false || item.Date === todaydate)) {
                return item.Time;
            } else {
                return null;
            }
        }),
        label: "PB only runs",
        borderColor: "#953ecd",
        fill: false,
        pointBackgroundColor: "#953ecd",
        pointRadius: 10,
        pointHoverRadius: 15
    });
    result.push({
        data: historyData.map(function (item) {
            if (item.Score == 100 && (checkdata == false || item.Date === todaydate)) {
                return item.Time;
            } else {
                return null;
            }
        }),
        label: "100% only runs",
        borderColor: "#ff3ecd",
        fill: false,
        pointBackgroundColor: "#ff3ecd",
        pointRadius: 5,
        pointHoverRadius: 10
    });
    result.push({
        data: historyData.map(function (item) {
            if (checkdata == false || item.Date === todaydate) {
                return item.Time
            } else {
                return null;
            }
        }),
        label: "All runs",
        borderColor: "#3e95cd",
        fill: false
    });
    return result;
}

(function () {
    'use strict';
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
    var tasktimes = [];
    var latesttime = 0;
    var splittime;
    var speedData = [];
    var splittimeList = [];
    var isDarkMode;
    var speedDataPB;
    var sliderValueP;
    var speedSets = [];
    var timesSets = [];
    var pacedata = [];
    var speedpace = [];
    var historygraphdata = [];
    var pbfinal;
    var chart1;
    var chart2;
    var chart3;
    var pbhistlist;
    const speedDataTxt = "SPEED_DATA_";
    const historySlotTxt = "PB_HISTORY";
    var savePBs = false;
    resetbutton = document.createElement("button");
    resetbutton.type = "button";
    resetbutton.innerHTML = 'Reset PB splits for that gamemode';
    resetbutton.style = "background-color:#f44336;border:none;color:#fff;padding:15px 32px;text-align:center;text-decoration:none;display:inline-block;font-size:15px";
    resetbutton.onclick = function () {
        GM_setValue(gameSave, undefined);
        GM_setValue(historySlotTxt + gameSave, undefined);
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
            tasktimes = [];
            speedData = [];
            splittimeList = [];
            speedSets = [];
            timesSets = [];
            pacedata = [];
            speedpace = [];
            historygraphdata = [];
            latesttime = 0;
            mylog.push(headers)
        }
        if (correctClicks == 1) {
            gameSave = gameMode + window.location.href;
            pbs = GM_getValue(gameSave)
            speedDataPB = GM_getValue(speedDataTxt + gameSave)
            pbisdef = (pbs !== undefined);
            if (pbisdef) {
                pbfinal = pbs.slice(-1)[0];
            }
        }
        if (correctClicks > my_correct) {
            my_correct = correctClicks;
            curTask = lastTask;
            lastTask = qText;
            t = gameDuration;
            mytime = t / 1000;
            mytimes.push(t);
            splittime = t - latesttime;
            splittimeList.push(splittime / 1000);
            latesttime = t;
            speedpace.push(questionCount * mytime / correctClicks)
            tasktimes.push({
                "task": "(" + correctClicks.toString() + ") " + curTask,
                "time": splittime
            });
            if (!pbisdef) {
                pbsplit = "-";
                pbsplittext = pbsplit;
                colors.push("Green");
                mytimestring = mytime.toString();
            } else {
                pbsplit = pbs[correctClicks - 1];
                dif = t - pbsplit;
                pacedata.push(pbfinal + dif);
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
            mylog.push([correctClicks.toString(), mytimestring, pbsplittext, score.toString() + "%", curTask + " (" + (splittime / 1000).toString() + ")"]);
            if (questionCount == correctClicks) {
                var runtime = mytimes.slice(-1)[0];
                speedData = splittimeList;
                var dmcb = document.getElementById("chkDarkMode");
                isDarkMode = dmcb.checked;
                savePBs = false;
                if (score == 100) {
                    if (!pbisdef) {
                        savePBs = true;
                    } else {
                        if (pbfinal > runtime) {
                            savePBs = true;
                        }
                    }
                }
                pbhistlist = GM_getValue(historySlotTxt + gameSave);
                if (pbhistlist === undefined) {
                    pbhistlist = [];
                }
                pbhistlist.push({
                    "Time": runtime / 1000,
                    "Score": score,
                    "Date": (new Date()).toJSON().slice(0, 10),
                    "ID": pbhistlist.length + 1,
                    "PB": savePBs
                });
                GM_setValue(historySlotTxt + gameSave, pbhistlist)
                saved = "No PB";
                if (savePBs) {
                    saved = "New PB!";
                    GM_setValue(gameSave, mytimes);
                    GM_setValue(speedDataTxt + gameSave, speedData);
                }
                statsDiv.appendChild(resetbutton);
                statsDiv.appendChild(document.createElement("br"));
                pbinfo = document.createElement("p");
                statsDiv.appendChild(pbinfo);
                pbinfo.style.textAlign = "center";
                pbinfo.style.fontSize = "18pt";
                if (savePBs) {
                    pbinfo.style.color = "Blue";
                    pbinfo.style.fontWeight = "bold";
                }
                pbinfo.appendChild(document.createTextNode(saved));
                if (!savePBs) {
                    var pbtipheader = document.createElement("p");
                    pbtipheader.style.textAlign = "center";
                    pbtipheader.style.fontSize = "12pt";
                    pbtipheader.appendChild(document.createTextNode("(keep in mind that each gamemode and ?atribute is differnt PB, also only 100% will be saved)"));
                    statsDiv.appendChild(pbtipheader);
                }
                var timeGraphHeader = document.createElement("p");
                timeGraphHeader.style.textAlign = "center";
                timeGraphHeader.style.fontSize = "18pt";
                timeGraphHeader.appendChild(document.createTextNode("Time graph"));
                statsDiv.appendChild(timeGraphHeader);
                var cnvSpeed = document.createElement("canvas");
                cnvSpeed.style.width = "100%";
                cnvSpeed.height = 600;
                var cnvTime = document.createElement("canvas");
                cnvTime.style.width = "100%";
                cnvTime.height = 600;
                statsDiv.appendChild(cnvTime);
                var speedGraphHeader = document.createElement("p");
                speedGraphHeader.style.textAlign = "center";
                speedGraphHeader.style.fontSize = "18pt";
                speedGraphHeader.appendChild(document.createTextNode("Speed graph"));
                statsDiv.appendChild(speedGraphHeader);
                var speedgraphtip = document.createElement("p");
                speedgraphtip.style.textAlign = "center";
                speedgraphtip.style.fontSize = "12pt";
                speedgraphtip.appendChild(document.createTextNode("(1 shows momental timings, max shows classic average speed)"));
                statsDiv.appendChild(speedgraphtip);
                sliderValueP = document.createElement("p");
                sliderValueP.style.textAlign = "center";
                sliderValueP.style.fontSize = "14pt";
                statsDiv.appendChild(sliderValueP);
                var slider = document.createElement("input");
                slider.type = 'range';
                slider.value = questionCount - 1;
                sliderValueP.innerHTML = parseInt(slider.value) + 1;
                slider.min = 0;
                slider.max = questionCount - 1;
                slider.step = 1;
                slider.style.width = "98.3%";
                slider.style.margin = "1.65%";
                statsDiv.appendChild(slider);
                statsDiv.appendChild(cnvSpeed);
                var historyGraphHeader = document.createElement("p");
                historyGraphHeader.style.textAlign = "center";
                historyGraphHeader.style.fontSize = "18pt";
                historyGraphHeader.appendChild(document.createTextNode("Runs history"));
                statsDiv.appendChild(historyGraphHeader);
                var onlytodaycb = document.createElement("input");
                onlytodaycb.type = 'checkbox';
                onlytodaycb.id = "onlytodaycb";
                onlytodaycb.style.width = "100%";
                var cblabelP = document.createElement("p");
                cblabelP.style.textAlign = "center";
                cblabelP.innerHTML="Check to show today's only";
                statsDiv.appendChild(cblabelP);
                statsDiv.appendChild(onlytodaycb);
                historygraphdata = setHistoryData(pbhistlist, onlytodaycb.checked);
                var cnvHistory = document.createElement("canvas");
                cnvHistory.style.width = "100%";
                cnvHistory.height = 600;
                statsDiv.appendChild(cnvHistory);
                timesSets.push({
                    data: mytimes.map(function (item) {
                        return item / 1000
                    }),
                    label: "Time",
                    borderColor: "#3e95cd",
                    fill: false
                });
                speedSets.push({
                    data: handleSpeed(speedData, slider.value),
                    label: "Speed",
                    borderColor: "#3e95cd",
                    fill: false
                });
                if (pbisdef) {
                    timesSets.push({
                        data: pbs.map(function (item) {
                            return item / 1000
                        }),
                        label: "Time (PB)",
                        borderColor: "#953ecd",
                        fill: false
                    });
                    speedSets.push({
                        data: handleSpeed(speedDataPB, slider.value),
                        label: "Speed (PB)",
                        borderColor: "#953ecd",
                        fill: false
                    });
                    timesSets.push({
                        data: pacedata.map(function (item) {
                            return item / 1000
                        }),
                        label: "Pace (by PB difference)",
                        borderColor: "#ff0000",
                        fill: false
                    });
                }
                timesSets.push({
                    data: speedpace,
                    label: "Pace (by current speed)",
                    borderColor: "#ff3ecd",
                    fill: false
                });
                var taskinfo = [...tasktimes];
                chart1 = new Chart(cnvTime, {
                    type: "line",
                    data: {
                        labels: Array.from({
                            length: questionCount
                        }, (_, i) => (i + 1).toString()),
                        datasets: timesSets
                    },
                    options: {
                        responsive: false,
                        animation: {
                            duration: 0
                        },
                        interaction: {
                            mode: 'index',
                            axis: 'x',
                            intersect: false
                        },
                        plugins: {
                            zoom: {
                                pan: {
                                    enabled: true,
                                    mode: 'x',
                                },
                                zoom: {
                                    wheel: {
                                        enabled: true,
                                        speed: 0.1,
                                    },
                                    mode: 'x',
                                    limits: {
                                        y: { min: 0 },
                                        x: { min: 0 }
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    title: function (context) {
                                        return taskinfo[context[0].dataIndex].task;
                                    }
                                }
                            }
                        }
                    }
                });
                chart2 = new Chart(cnvSpeed, {
                    type: "line",
                    data: {
                        labels: Array.from({
                            length: questionCount
                        }, (_, i) => (i + 1).toString()),
                        datasets: speedSets
                    },
                    options: {
                        responsive: false,
                        animation: {
                            duration: 0
                        },
                        interaction: {
                            mode: 'index',
                            axis: 'x',
                            intersect: false
                        },
                        plugins: {
                            zoom: {
                                pan: {
                                    enabled: true,
                                    mode: 'x',
                                },
                                zoom: {
                                    wheel: {
                                        enabled: true,
                                        speed: 0.1,
                                    },
                                    mode: 'x',
                                    limits: {
                                        y: { min: 0 },
                                        x: { min: 0 }
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    title: function (context) {
                                        return taskinfo[context[0].dataIndex].task;
                                    }
                                }
                            }
                        }
                    }
                });
                chart3 = new Chart(cnvHistory, {
                    type: "line",
                    data: {
                        labels: Array.from({
                            length: pbhistlist.length
                        }, (_, i) => (i + 1).toString()),
                        datasets: historygraphdata
                    },
                    options: {
                        responsive: false,
                        animation: {
                            duration: 0
                        },
                        interaction: {
                            mode: 'index',
                            axis: 'xy',
                            intersect: false
                        },
                        plugins: {
                            zoom: {
                                pan: {
                                    enabled: true,
                                    mode: 'x',
                                },
                                zoom: {
                                    wheel: {
                                        enabled: true,
                                        speed: 0.1,
                                    },
                                    mode: 'x',
                                    limits: {
                                        y: { min: 0 },
                                        x: { min: 0 }
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    title: function (context) {
                                        var myitem = pbhistlist[context[0].dataIndex];
                                        var mystring = myitem.Time.toString();
                                        return mystring;
                                    },
                                    label: function (context) {
                                        var myitem = pbhistlist[context.dataIndex];
                                        if (myitem.PB) {
                                            return "PB!";
                                        }
                                        if (myitem.Score == 100) {
                                            return "100%!";
                                        }
                                        return "" + myitem.Score.toString() + "%";
                                    },
                                    footer: function (context) {
                                        var myitem = pbhistlist[context[0].dataIndex];
                                        var mystring = myitem.Date;
                                        mystring += "\n" + "#" + myitem.ID.toString();
                                        return mystring;
                                    }
                                }
                            }
                        }
                    }
                });
                statsDiv.classList.add("table");
                var splitsHeader = document.createElement("p");
                splitsHeader.style.textAlign = "center";
                splitsHeader.style.fontSize = "18pt";
                splitsHeader.appendChild(document.createTextNode("Splits"));
                statsDiv.appendChild(splitsHeader);
                tbl = document.createElement('div');
                tbl.classList.add("table");
                mylog.forEach((row, rowindex) => {
                    const tr = document.createElement('div');
                    tr.classList.add("row");
                    if (isDarkMode && rowindex > 0) {
                        if (rowindex % 2 == 0) {
                            tr.style.background = "#303030";
                        } else {
                            tr.style.background = "#404040";
                        }
                    }
                    tbl.appendChild(tr);
                    row.forEach((cell, cellindex) => {
                        const td = document.createElement('div');
                        if (cellindex == 1 && rowindex > 0) {
                            td.style.color = colors[rowindex - 1];
                        }
                        td.classList.add("cell");
                        td.appendChild(document.createTextNode(cell));
                        tr.appendChild(td);
                    });
                });
                statsDiv.appendChild(tbl);
                var tasksheader = document.createElement("p");
                tasksheader.style.textAlign = "center";
                tasksheader.style.fontSize = "18pt";
                tasksheader.appendChild(document.createTextNode("Task timings"));
                statsDiv.appendChild(tasksheader);
                var tasklisttip = document.createElement("p");
                tasklisttip.style.textAlign = "center";
                tasklisttip.style.fontSize = "12pt";
                tasklisttip.appendChild(document.createTextNode("(from slowest to fastest)"));
                statsDiv.appendChild(tasklisttip);

                tasktimes = tasktimes.sort((a, b) => b.time - a.time);
                tasktimes.unshift({
                    "task": "Task",
                    "time": "Time"
                })
                tbl = document.createElement('div');
                tbl.classList.add("table");
                tasktimes.forEach((row, rowindex) => {
                    const tr = document.createElement('div');
                    tr.classList.add("row");
                    if (isDarkMode && rowindex > 0) {
                        if (rowindex % 2 == 0) {
                            tr.style.background = "#303030";
                        } else {
                            tr.style.background = "#404040";
                        }
                    }
                    tbl.appendChild(tr);
                    var td = document.createElement('div');
                    td.classList.add("cell");
                    td.appendChild(document.createTextNode(row.task));
                    tr.appendChild(td);
                    td = document.createElement('div');
                    td.classList.add("cell");
                    if (row.time != "Time") {
                        row.time = (row.time / 1000).toString();
                    }
                    td.appendChild(document.createTextNode(row.time));
                    tr.appendChild(td);
                });
                statsDiv.appendChild(tbl);
                onlytodaycb.onclick = function () {
                    historygraphdata = setHistoryData(pbhistlist, onlytodaycb.checked);
                    chart3.data.datasets = historygraphdata;
                    chart3.update();
                }
                slider.oninput = function () {
                    sliderValueP.innerHTML = parseInt(slider.value) + 1;
                    var newsets = []
                    newsets.push({
                        data: handleSpeed(speedData, slider.value),
                        label: "Speed",
                        borderColor: "#3e95cd",
                        fill: false
                    });
                    if (pbisdef) {
                        newsets.push({
                            data: handleSpeed(speedDataPB, slider.value),
                            label: "Speed (PB)",
                            borderColor: "#953ecd",
                            fill: false
                        });
                    }
                    chart2.data.datasets = newsets;
                    chart2.update();
                }
            }
        }
    });
})();
