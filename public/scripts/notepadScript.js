var oldText = "";

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function notepadUpdate() {
    var textbox = document.getElementById("notepadTextArea");
    oldText = textbox.value;
    notepadUpdateCookie()
    var xhttp = new XMLHttpRequest();
    var params = "cookie="+getCookie("login")+"&text="+textbox.value;
    xhttp.open("GET", "updateText?"+params, true);
    xhttp.send();
}

function notepadUpdateCookie() {
    var textbox = document.getElementById("notepadTextArea");
    document.cookie = "text="+textbox.value;
}

window.setInterval(function() {
    var textbox = document.getElementById("notepadTextArea");
    if (textbox.value != oldText) {
        notepadUpdate();
    }
}, 5000);

function notepadLoad() {
    var textbox = document.getElementById("notepadTextArea");
    textbox.addEventListener('keyup', notepadUpdateCookie);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var text = this.responseText;
            textbox.value = text;
            oldText = text;
        }
    }
    var textboxText = getCookie("text");
    if (textboxText === undefined) {
        xhttp.open("GET", "getText?cookie="+getCookie("login"), true);
        xhttp.send();
    } else {
        textbox.value = textboxText;
        notepadUpdate();
    }
    var mode = getCookie("mode");
    if (mode == "dark") {
        setMode(0);
    } else {
        setMode(1);
    }
}

function logout() {
    var textbox = document.getElementById("notepadTextArea");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var text = this.responseText;
            document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "text=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "login";
        }
    }
    var params = "cookie="+getCookie("login")+"&text="+textbox.value;
    xhttp.open("GET", "logout?"+params, true);
    xhttp.send();
}

function setMode(mode) {
    var modeLink = document.getElementById("switchMode");
    var body = document.getElementsByTagName("body")[0];
    var textarea = document.getElementById("notepadTextArea");
    if (mode == 0) {
        // set to dark mode
        modeLink.innerHTML = "Light Mode";
        body.className = "dark-mode";
        textarea.className = "notepad dark-mode";
        document.cookie = "mode=dark";
    } else {
        // set to light mode
        modeLink.innerHTML = "Dark Mode";
        body.className = "light-mode";
        textarea.className = "notepad light-mode";
        document.cookie = "mode=light";
    }
}

function switchMode() {
    var modeLink = document.getElementById("switchMode");
    if (modeLink.innerHTML == "Dark Mode") {
        // Switch to dark mode
        setMode(0);
    } else {
        // Switch to light mode
        setMode(1);
    }
}

function openNav() {
    document.getElementById("navOverlay").style.height = "50%";
    document.getElementById("navOverlay").style.minHeight = "300px";
}

function closeNav() {
    document.getElementById("navOverlay").style.height = "0%";
    document.getElementById("navOverlay").style.minHeight = "0";
}
