const form = document.getElementById("form");
const username = document.getElementById("username");
const password = document.getElementById("password");
const error = document.getElementById("error");
const passwordDiv = document.getElementById("passdiv");
const usernameDiv = document.getElementById("usrdiv");
const header = document.getElementById("header");
const subheader = document.getElementById("subheader");
const loginLink = document.getElementById("loginLink");

loginURL = window.location.origin + "/login";

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
    } else if (psw.length == 0){
        errMsg = "Please enter a password";
    } else if (psw.length > 25) {
        errMsg = "Password is too long";
    } else if (!alphaNumericSpecial.test(psw)) { 
        errMsg = "Password contains invalid characters";
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

                window.location.pathname = "protected/site.html"
            } else {
                error.innerHTML = json.body;
                if(json.code === 1){
                    error.innerHTML+=". <a href=\"/login.html\">If its yours, Login!</a>"
                }
            }
        });
    }
})