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
