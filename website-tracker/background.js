let previousWebsite = "";
let switchCounts = {};

chrome.tabs.onActivated.addListener(trackWebsite);
chrome.tabs.onUpdated.addListener(trackWebsite);

async function trackWebsite() {

    let tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (tabs.length === 0) return;

    let tab = tabs[0];

    if (!tab.url) return;

    if (tab.url.startsWith("chrome://")) return;

    let website = new URL(tab.url).hostname;

    if (website === previousWebsite) return;

    if (!(website in switchCounts)) {
        switchCounts[website] = 0;
    } else {
        switchCounts[website]++;
    }

    previousWebsite = website;

    // Send data to FastAPI
    fetch("http://127.0.0.1:8000/track", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: 
            Number(localStorage.getItem("user_id")),
            website: website,
            switch_count: switchCounts[website]
        })
    })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
}