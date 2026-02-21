const form = document.getElementById("form");
const username = document.getElementById("username");
const password = document.getElementById("password");
const error = document.getElementById("error");
const passwordDiv = document.getElementById("passdiv");
const usernameDiv = document.getElementById("usrdiv");
const header = document.getElementById("header");
const subheader = document.getElementById("subheader");
const loginLink = document.getElementById("loginLink");

lightVersion = window.location.search === "?light";
loginURL = window.location.origin + "/login";

if(lightVersion){
    goLightLogin();
}

function goLightLogin() {
    lightVersion = true;
    loginURL = window.location.origin + "/lightlogin";
    passwordDiv.style.display = "None";

    usernameDiv.style.borderBottomLeftRadius = "7px";
    usernameDiv.style.borderBottomRightRadius = "7px";
    usernameDiv.style.borderBottomStyle = "solid";

    header.innerHTML = "What shall you be <strong>named</strong>?";
    subheader.innerHTML = "This is <strong>temporary</strong> and <strong>not unique</strong>, to claim it as yours register an account!";
    loginLink.innerHTML = "<a href=\"/login.html\">I have an account!</a>";
}

function goFullLogin() {
    lightVersion = false;
    loginURL = window.location.origin +"/login";
    passwordDiv.style.display = "";

    usernameDiv.style.borderBottomLeftRadius = "";
    usernameDiv.style.borderBottomRightRadius = "";
    usernameDiv.style.borderBottomStyle = "none";

    header.innerHTML = "Login to the <strong>Grebel Canvas</strong>";
    subheader.innerHTML = "Reach out to Ben to get an account!";
    loginLink.innerHTML = "<a href=\"/login.html?light\">I don't want to use an account!</a>";
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let usr = username.value;
    let psw = password.value;
    let errMsg = "";

    let alphaNumeric = /^[0-9A-Za-z]+$/;
    let alphaNumericSpecial = /^[0-9A-Za-z#$@&]+$/;

    if(usr.length == 0) {
        errMsg = "Please enter a username";
    } else if (usr.length > 25) {
        errMsg = "Username is too long";
    } else if (!alphaNumeric.test(usr)) {
        errMsg = "Username contains invalid characters";
    } else if(!lightVersion) {
        if (psw.length == 0){
            errMsg = "Please enter a password";
        } else if (psw.length > 25) {
            errMsg = "Password is too long";
        } else if (!alphaNumericSpecial.test(psw)) { 
            errMsg = "Password contains invalid characters";
        } 
    }

    if(errMsg != "") {
        error.innerHTML = errMsg;
    } else {
        fetch(loginURL, {
            method: "POST",
            body: JSON.stringify({
                username: usr,
                password: psw,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then((response) => response.json())
        .then((json) => {
            if(json.success){
                console.log(window.location)

                window.location.pathname = "light/site.html"
            } else {
                error.innerHTML = json.body;
                if(json.code === 1){
                    error.innerHTML+=". <a href=\"/login.html\">If its yours, Login!</a>"
                }
            }
        });
    }
})