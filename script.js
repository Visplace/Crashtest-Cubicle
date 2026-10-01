(function () {
  "use strict";

  var data = window.CUBICLE || { TRACKS: [], LINKS: [] };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- terminal on the CRT ---------- */
  var term = document.getElementById("terminal");
  var hasMusic = data.TRACKS && data.TRACKS.length > 0;
  var lines = [
    "C:\\STUCK\\V1> dir",
    "",
    " ENGINE.SYS    2001",
    " ESCAPE.PLN       0",
    " SONGS      " + (hasMusic ? data.TRACKS.length + " file(s)" : "<soon>"),
    "",
    "C:\\UNSTUCK\\V1> run crashtest.exe",
    hasMusic ? "!!!ok. check your voicemail." : "!!!not yet.",
    "",
    "C:\\KEEPTRYING\\LOL> "
  ];
  var text = lines.join("\n");

  function renderTerm(n) {
    term.textContent = text.slice(0, n);
    var c = document.createElement("span");
    c.className = "cursor";
    c.textContent = "\u2588";
    term.appendChild(c);
  }

  if (reduceMotion) {
    renderTerm(text.length);
  } else {
    var i = 0;
    (function type() {
      renderTerm(i);
      if (i >= text.length) return;
      var ch = text.charAt(i++);
      setTimeout(type, ch === "\n" ? 300 : 18 + Math.random() * 40);
    })();
  }

  /* ---------- the bad light ---------- */
  var bad = document.querySelector("[data-bad-light]");
  var flicker = document.querySelector(".flicker");
  if (!reduceMotion) {
    bad.classList.add("is-stuttering");
    (function flick() {
      setTimeout(function () {
        flicker.classList.remove("is-on");
        void flicker.offsetWidth;
        flicker.classList.add("is-on");
        flick();
      }, 9000 + Math.random() * 16000);
    })();
  }

  /* ---------- clock on the desk ---------- */
  var clock = document.getElementById("clock");
  function tick() {
    var d = new Date();
    var h = d.getHours() % 12 || 12;
    var m = String(d.getMinutes()).padStart(2, "0");
    clock.textContent = h + ":" + m + (d.getHours() < 12 ? "am" : "pm") +
      (d.getHours() >= 17 || d.getHours() < 8 ? " (after hours)" : "");
  }
  tick();
  setInterval(tick, 20000);

  /* ---------- voicemail = music ---------- */
  var list = document.getElementById("tracks");
  var empty = document.getElementById("empty");
  var count = document.getElementById("vm-title");
  var player = document.getElementById("player");
  var current = null;

  if (hasMusic) {
    empty.hidden = true;
    count.textContent = "(" + data.TRACKS.length + ") new message" + (data.TRACKS.length === 1 ? "" : "s");

    data.TRACKS.forEach(function (t, idx) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "track";
      btn.innerHTML =
        '<span class="track__btn" aria-hidden="true">\u25B6</span>' +
        '<span><span class="track__title"></span><span class="track__note"></span></span>';
      btn.querySelector(".track__title").textContent = (idx + 1) + ". " + t.title;
      btn.querySelector(".track__note").textContent = t.note || "";
      btn.setAttribute("aria-label", "play " + t.title);
      btn.addEventListener("click", function () { toggle(btn, t); });
      li.appendChild(btn);
      list.appendChild(li);
    });

    player.addEventListener("ended", function () {
      var next = current && current.parentNode.nextElementSibling;
      setPlaying(null);
      if (next) next.firstChild.click();
    });
  }

  function setPlaying(btn) {
    if (current) {
      current.classList.remove("is-playing");
      current.querySelector(".track__btn").textContent = "\u25B6";
    }
    current = btn;
    if (btn) {
      btn.classList.add("is-playing");
      btn.querySelector(".track__btn").textContent = "\u275A\u275A";
    }
  }

  function toggle(btn, t) {
    if (current === btn && !player.paused) {
      player.pause();
      setPlaying(null);
      return;
    }
    if (current !== btn) player.src = t.file;
    player.play();
    setPlaying(btn);
  }

  /* ---------- links ---------- */
  if (data.LINKS && data.LINKS.length) {
    var ul = document.getElementById("link-list");
    data.LINKS.forEach(function (l) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = l.url;
      a.textContent = l.label;
      if (!/^mailto:/.test(l.url)) { a.target = "_blank"; a.rel = "noopener"; }
      li.appendChild(a);
      ul.appendChild(li);
    });
    document.getElementById("links").hidden = false;
  }

  /* ---------- the exit sign (it doesn't go anywhere) ---------- */
  var exit = document.querySelector(".exit");
  var exitNote = document.getElementById("exit-note");
  var replies = ["nice try.", "it's painted on.", "nowhere to go.", "back to work.", "maybe tomorrow."];
  var replyIdx = 0;
  var exitTimer = null;
  exit.addEventListener("click", function () {
    exit.classList.add("is-lit");
    exitNote.textContent = replies[replyIdx++ % replies.length];
    exitNote.classList.remove("is-shown");
    void exitNote.offsetWidth;
    exitNote.classList.add("is-shown");
    clearTimeout(exitTimer);
    exitTimer = setTimeout(function () {
      exit.classList.remove("is-lit");
      exitNote.classList.remove("is-shown");
    }, 2200);
  });

  /* ---------- tic-tac-toe on the cubicle wall ---------- */
  var board = document.getElementById("ttt");
  var tttNote = document.getElementById("ttt-note");
  var cells = [];
  var marks = [];
  var over = false;
  var LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function winner(m) {
    for (var k = 0; k < LINES.length; k++) {
      var l = LINES[k];
      if (m[l[0]] && m[l[0]] === m[l[1]] && m[l[0]] === m[l[2]]) return l;
    }
    return null;
  }

  function place(idx, who) {
    marks[idx] = who;
    cells[idx].innerHTML = who === "X"
      ? '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M9 8 Q20 21 32 33 M31 7 Q19 19 8 32"/></svg>'
      : '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M22 7 C10 6 6 17 8 25 C10 33 22 35 29 29 C35 23 33 11 24 8 L19 7"/></svg>';
    cells[idx].classList.add(who === "X" ? "is-x" : "is-o");
    cells[idx].disabled = true;
    cells[idx].setAttribute("aria-label", who);
  }

  function finish(line, msg) {
    over = true;
    if (line) line.forEach(function (k) { cells[k].classList.add("is-win"); });
    cells.forEach(function (c) { c.disabled = true; });
    tttNote.textContent = msg;
    setTimeout(resetGame, 2200);
  }

  function pickMove() {
    var open = [];
    for (var k = 0; k < 9; k++) if (!marks[k]) open.push(k);
    // win if possible, then block, then centre, otherwise anywhere (a little sloppy on purpose)
    var tries = ["O", "X"];
    for (var t = 0; t < tries.length; t++) {
      for (var j = 0; j < open.length; j++) {
        var test = marks.slice();
        test[open[j]] = tries[t];
        if (winner(test) && (t === 0 || Math.random() < .85)) return open[j];
      }
    }
    if (!marks[4]) return 4;
    return open[Math.floor(Math.random() * open.length)];
  }

  function play(idx) {
    if (over || marks[idx]) return;
    place(idx, "X");
    var line = winner(marks);
    if (line) return finish(line, "ok fine. you win.");
    if (marks.filter(Boolean).length === 9) return finish(null, "tie. obviously.");
    cells.forEach(function (c) { c.disabled = true; });
    tttNote.textContent = "hmm...";
    setTimeout(function () {
      place(pickMove(), "O");
      cells.forEach(function (c, k) { c.disabled = !!marks[k]; });
      var l2 = winner(marks);
      if (l2) return finish(l2, "ha. back to work.");
      if (marks.filter(Boolean).length === 9) return finish(null, "tie. obviously.");
      tttNote.textContent = "your move";
    }, 500);
  }

  function resetGame() {
    board.innerHTML = "";
    cells = [];
    marks = [];
    over = false;
    for (var k = 0; k < 9; k++) {
      var c = document.createElement("button");
      c.type = "button";
      c.className = "ttt__cell";
      c.style.left = (k % 3) * 33.333 + "%";
      c.style.top = Math.floor(k / 3) * 33.333 + "%";
      c.setAttribute("aria-label", "empty square " + (k + 1));
      c.addEventListener("click", play.bind(null, k));
      board.appendChild(c);
      cells.push(c);
    }
    tttNote.textContent = "your move";
  }
  resetGame();

  /* ---------- the car tries to leave ---------- */
  var carBtn = document.querySelector(".car-btn");
  var driving = false;
  carBtn.addEventListener("click", function () {
    if (driving || reduceMotion) return;
    driving = true;

    var runaway = document.createElement("div");
    runaway.className = "runaway";
    runaway.appendChild(carBtn.querySelector("svg").cloneNode(true));
    document.body.appendChild(runaway);
    carBtn.style.visibility = "hidden";

    runaway.addEventListener("animationend", function () {
      document.body.classList.add("crashed");
      flicker.classList.remove("is-on");
      void flicker.offsetWidth;
      flicker.classList.add("is-on");

      var crash = document.createElement("div");
      crash.className = "crash";
      crash.textContent = "*CRASH*";
      document.body.appendChild(crash);

      setTimeout(function () {
        runaway.remove();
        crash.remove();
        document.body.classList.remove("crashed");
        carBtn.style.visibility = "";
        driving = false;
      }, 1700);
    });
  });
})();
