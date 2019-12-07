function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function loginLoad() {
    if(getCookie("mode") === 'light') {
        setMode(1);
    } else {
        setMode(0);
    }
}

function setEach(elementArray, classname) {
    for (var i = 0; i < elementArray.length; i++) {
        elementArray[i].classList.remove("dark-mode");
        elementArray[i].classList.remove("light-mode");
        elementArray[i].classList.add(classname);
    }
}

function setMode(mode) {
    var body = document.getElementsByTagName("body")[0];
    var labels = document.getElementsByTagName("label");
    var inputs = document.getElementsByTagName("input");
    var paragraphs = document.getElementsByTagName("paragraph");
    if (mode == 0) {
        // set to dark mode
        body.className = "dark-mode";
        setEach(labels, "dark-mode");
        setEach(inputs, "dark-mode");
        setEach(paragraphs, "dark-mode");
        document.cookie = "mode=dark";
    } else {
        // set to light mode
        body.className = "light-mode";
        setEach(labels, "light-mode");
        setEach(inputs, "light-mode");
        setEach(paragraphs, "light-mode");
        document.cookie = "mode=light";
    }
}

function passValidate(password) {
    var password = document.getElementById("password").value;
    if (password.length == 0) {
        document.getElementById("passwordValid").innerHTML = "No password entered";
    } else if (password.length < 8) {
        document.getElementById("passwordValid").innerHTML = "Password is too short";
    } else {
        document.getElementById("passwordValid").innerHTML = "";
    }
}

function userValidate() {
    var valid = true;
    var username = document.getElementById("username").value;
    var loginBtn = document.getElementById("loginBtn");
    var createBtn = document.getElementById("createBtn");
    var verifyInput = document.getElementById("verifyPassword");
    if (username.length == 0) {
        valid = false;
        document.getElementById("usernameValid").innerHTML = "No username entered";
        loginBtn.style.display = "block";
        createBtn.style.display = "none";
        verifyInput.style.display = "none";
    } else {
        document.getElementById("usernameValid").innerHTML = "";
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var text = this.responseText;
                switch(text) {
                    case "error":
                        document.getElementById("usernameValid").innerHTML = "There's a problem on our end";
                        break;
                    case "true":
                        loginBtn.style.display = "block";
                        createBtn.style.display = "none";
                        verifyInput.style.display = "none";
                        break;
                    case "false":
                        loginBtn.style.display = "none";
                        createBtn.style.display = "block";
                        verifyInput.style.display = "inline";
                        break;
                }
            }
        }
        xhttp.open("GET", "username?user="+username, true);
        xhttp.send();
    }
    return true;
}

function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var text = this.responseText;
            console.log(text);
            switch(text) {
                case "error":
                    document.getElementById("passwordValid").innerHTML = "There's a problem on our end";
                    break;
                case "false":
                    document.getElementById("passwordValid").innerHTML = "Password is incorrect";
                    break;
                default:
                    window.location.href = "notepad";
                    break;
            }
        }
    }
    xhttp.open("GET", "password?user="+username+"&pass="+password, true);
    xhttp.send();
}

function newAccount() {
    var username = document.getElementById("username").value;
    var password1 = document.getElementById("password").value;
    var password2 = document.getElementById("verifyPassword").value;
    if (password1 != password2) {
        document.getElementById("passwordValid").innerHTML = "Passwords don't match";
        return;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var text = this.responseText;
            console.log(text);
            window.location.href = "notepad"
        }
    }
    xhttp.open("GET", "newAccount?user="+username+"&pass="+password1, true);
    xhttp.send();
}

var usernameInput = document.getElementById("username");
usernameInput.addEventListener('keyup', userValidate);
var passwordInput = document.getElementById("password");
passwordInput.addEventListener('keyup', passValidate);
