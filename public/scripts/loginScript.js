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
                    console.log("default");
                    document.cookie = "login="+username;
                    //TODO https://fishbowl.pastiche.org/2004/01/19/persistent_login_cookie_best_practice
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
            document.cookie = "login="+username;
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
