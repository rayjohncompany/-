/*
 * LINE -> HubSpot meeting bridge
 * Replace LINE_URL and HUBSPOT_MEETING_URL below, then load this file before </body>.
 */
(function () {
  "use strict";

  var LINE_URL = "https://lin.ee/yQXh0Ma";
  var HUBSPOT_MEETING_URL = "https://meetings-na2.hubspot.com/swp-oneforall";

  var config = {
    title: "ご相談・日程予約",
    lead: "LINEで相談内容を送るか、空いている日時をそのまま予約できます。",
    lineLabel: "公式LINEで相談する",
    bookingLabel: "HubSpotで日程を予約する",
    floatingLabel: "LINE相談 / 予約",
    closeLabel: "閉じる"
  };

  var css = [
    ".lhb-floating{position:fixed;right:18px;bottom:18px;z-index:2147483000;border:0;border-radius:999px;background:#06c755;color:#fff;padding:14px 18px;font:700 15px/1.2 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;box-shadow:0 12px 28px rgba(0,0,0,.22);cursor:pointer}",
    ".lhb-floating:focus-visible,.lhb-action:focus-visible,.lhb-close:focus-visible{outline:3px solid #111;outline-offset:3px}",
    ".lhb-backdrop{position:fixed;inset:0;z-index:2147483001;display:none;background:rgba(10,16,24,.54);padding:18px;box-sizing:border-box}",
    ".lhb-backdrop.is-open{display:grid;place-items:center}",
    ".lhb-dialog{width:min(920px,100%);max-height:min(760px,92vh);overflow:hidden;border-radius:8px;background:#fff;color:#142033;box-shadow:0 24px 80px rgba(0,0,0,.35);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
    ".lhb-head{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;padding:22px 22px 14px;border-bottom:1px solid #e7ebf0}",
    ".lhb-title{margin:0;font-size:21px;line-height:1.3;letter-spacing:0;font-weight:800}",
    ".lhb-lead{margin:7px 0 0;color:#566274;font-size:14px;line-height:1.7}",
    ".lhb-close{display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border:1px solid #d8dee8;border-radius:999px;background:#fff;color:#142033;font-size:22px;line-height:1;cursor:pointer}",
    ".lhb-body{padding:20px 22px 22px}",
    ".lhb-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}",
    ".lhb-action{display:flex;align-items:center;justify-content:center;min-height:52px;border:1px solid #cfd7e3;border-radius:8px;background:#fff;color:#142033;text-decoration:none;font-weight:800;font-size:15px;cursor:pointer}",
    ".lhb-action--line{border-color:#06c755;background:#06c755;color:#fff}",
    ".lhb-action--hubspot{border-color:#ff5c35;background:#ff5c35;color:#fff}",
    ".lhb-meeting{display:none;min-height:640px;border:1px solid #e0e6ef;border-radius:8px;overflow:hidden}",
    ".lhb-meeting.is-open{display:block}",
    ".lhb-meeting .meetings-iframe-container{min-height:640px}",
    "@media(max-width:680px){.lhb-floating{right:12px;bottom:12px;padding:13px 15px;font-size:14px}.lhb-backdrop{padding:10px}.lhb-dialog{max-height:94vh}.lhb-head{padding:18px 16px 12px}.lhb-body{padding:16px}.lhb-actions{grid-template-columns:1fr}.lhb-meeting,.lhb-meeting .meetings-iframe-container{min-height:620px}}"
  ].join("");

  function appendStyles() {
    if (document.getElementById("lhb-styles")) return;
    var style = document.createElement("style");
    style.id = "lhb-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function loadHubSpotMeetingsScript() {
    if (document.querySelector('script[src*="MeetingsEmbedCode.js"]')) return;
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
    document.body.appendChild(script);
  }

  function withTracking(url, source) {
    try {
      var result = new URL(url, window.location.href);
      var current = new URL(window.location.href);
      result.searchParams.set("utm_source", current.searchParams.get("utm_source") || source);
      result.searchParams.set("utm_medium", current.searchParams.get("utm_medium") || "website");
      result.searchParams.set("utm_campaign", current.searchParams.get("utm_campaign") || "line_consultation");
      result.searchParams.set("referrer", window.location.href);
      return result.toString();
    } catch (error) {
      return url;
    }
  }

  function meetingEmbedUrl() {
    try {
      var result = new URL(withTracking(HUBSPOT_MEETING_URL, "hubspot_meetings"), window.location.href);
      result.searchParams.set("embed", "true");
      return result.toString();
    } catch (error) {
      return HUBSPOT_MEETING_URL;
    }
  }

  function openDialog(backdrop, meetingPanel) {
    backdrop.classList.add("is-open");
    backdrop.setAttribute("aria-hidden", "false");
    meetingPanel.classList.remove("is-open");
  }

  function closeDialog(backdrop) {
    backdrop.classList.remove("is-open");
    backdrop.setAttribute("aria-hidden", "true");
  }

  function build() {
    appendStyles();

    var floating = document.createElement("button");
    floating.type = "button";
    floating.className = "lhb-floating";
    floating.textContent = config.floatingLabel;

    var backdrop = document.createElement("div");
    backdrop.className = "lhb-backdrop";
    backdrop.setAttribute("aria-hidden", "true");

    var dialog = document.createElement("section");
    dialog.className = "lhb-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "lhb-title");

    var head = document.createElement("div");
    head.className = "lhb-head";

    var copy = document.createElement("div");
    var title = document.createElement("h2");
    title.id = "lhb-title";
    title.className = "lhb-title";
    title.textContent = config.title;
    var lead = document.createElement("p");
    lead.className = "lhb-lead";
    lead.textContent = config.lead;
    copy.appendChild(title);
    copy.appendChild(lead);

    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "lhb-close";
    closeButton.setAttribute("aria-label", config.closeLabel);
    closeButton.textContent = "x";

    head.appendChild(copy);
    head.appendChild(closeButton);

    var body = document.createElement("div");
    body.className = "lhb-body";

    var actions = document.createElement("div");
    actions.className = "lhb-actions";

    var lineLink = document.createElement("a");
    lineLink.className = "lhb-action lhb-action--line";
    lineLink.href = withTracking(LINE_URL, "official_line");
    lineLink.target = "_blank";
    lineLink.rel = "noopener";
    lineLink.textContent = config.lineLabel;

    var bookingButton = document.createElement("button");
    bookingButton.type = "button";
    bookingButton.className = "lhb-action lhb-action--hubspot";
    bookingButton.textContent = config.bookingLabel;

    var meetingPanel = document.createElement("div");
    meetingPanel.className = "lhb-meeting";

    var meetingContainer = document.createElement("div");
    meetingContainer.className = "meetings-iframe-container";
    meetingContainer.setAttribute("data-src", meetingEmbedUrl());
    meetingPanel.appendChild(meetingContainer);

    actions.appendChild(lineLink);
    actions.appendChild(bookingButton);
    body.appendChild(actions);
    body.appendChild(meetingPanel);
    dialog.appendChild(head);
    dialog.appendChild(body);
    backdrop.appendChild(dialog);

    floating.addEventListener("click", function () {
      openDialog(backdrop, meetingPanel);
    });
    closeButton.addEventListener("click", function () {
      closeDialog(backdrop);
    });
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) closeDialog(backdrop);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeDialog(backdrop);
    });
    bookingButton.addEventListener("click", function () {
      meetingPanel.classList.add("is-open");
      loadHubSpotMeetingsScript();
      setTimeout(function () {
        meetingPanel.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, 100);
    });

    document.body.appendChild(floating);
    document.body.appendChild(backdrop);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
