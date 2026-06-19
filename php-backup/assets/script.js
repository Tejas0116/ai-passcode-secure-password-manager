const loginForm = document.querySelector('.login-form');
const registrationForm = document.querySelector('.registration-form');
const showLoginForm = document.querySelector('.show-login-form');
const showRegistrationForm = document.querySelector('.show-registration-form');

// registrationForm.style.display = "none";

function showLogin() {
    loginForm.style.display = "none";
    registrationForm.style.display = "";
}
showLoginForm.addEventListener("click", showLogin);

function showRegistration() {
    loginForm.style.display = "";
    registrationForm.style.display = "none";
}
showRegistrationForm.addEventListener("click", showRegistration);

// View user
function view_user(id) {
    $("#viewUserModal").modal("show");

}

// Update account
function update_account(id) {
    $("#updateAccountModal").modal("show");

    let updateAccountID = $("#accountID-" + id).text();
    let updateAccountName = $("#accountName-" + id).text();
    let updateUsername = $("#username-" + id).text();
    let updatePassword = $("#password-" + id).text();
    let updateLink = $("#link-" + id).text();
    let updateDescription = $("#description-" + id).text();

    $("#updateAccountID").val(updateAccountID);
    $("#updateAccountName").val(updateAccountName);
    $("#updateUsername").val(updateUsername);
    $("#updatePassword").val(updatePassword);
    $("#updateLink").val(updateLink);
    $("#updateDescription").val(updateDescription);
}

// Delete account
function delete_account(id) {
    if (confirm("Do you want to delete this account?")) {
        window.location = "./endpoint/delete-account.php?account=" + id;
    }
}

// Enable and disable editing
function editDetails(button) {
    const form = button.form;
    const inputElements = form.querySelectorAll('.user-detail');
    for (var i = 0; i < inputElements.length; i++) {
        inputElements[i].disabled = !inputElements[i].disabled;
    }

    document.getElementById('editButton').style.display = "none";
    document.getElementById('saveButton').style.display = "";
    document.getElementById('deleteButton').style.display = "";
    document.getElementById('cancelButton').style.display = "";
}

function cancelEditDetails(button) {
    const form = button.form;
    const inputElements = form.querySelectorAll('.user-detail');
    for (var i = 0; i < inputElements.length; i++) {
        inputElements[i].disabled = !inputElements[i].disabled;
    }

    document.getElementById('editButton').style.display = "";
    document.getElementById('deleteButton').style.display = "none";
    document.getElementById('saveButton').style.display = "none";
    document.getElementById('cancelButton').style.display = "none";
}

// Delete user
function deleteUser(id) {
    if (confirm("Do you want to delete this user? The registered accounts on this user will also be deleted.")) {
        window.location = "./endpoint/delete-user.php?user=" + id;
    }
}

// Show password
function togglePasswordVisibility(accountID) {
    var passwordInput = document.getElementById("password-input-" + accountID);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}