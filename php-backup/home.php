<?php
session_start();
include ('./conn/conn.php');

/* Logout Function */
if(isset($_GET['logout'])){
    session_unset();
    session_destroy();
    header("Location: index.php");
    exit();
}

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}

$user_id = $_SESSION['user_id'];

// Fetch user's name
$stmt = $conn->prepare("SELECT `name` FROM `tbl_user` WHERE `tbl_user_id` = :user_id");
$stmt->bindParam(':user_id', $user_id);
$stmt->execute();
$user_name = ($stmt->rowCount() > 0) ? $stmt->fetch()['name'] : "User";

include ('./partials/header.php');
include ('./partials/modal.php');
?>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

body{
    margin:0;
    padding:0;
    font-family:'Poppins',sans-serif;
    background:url('https://images.unsplash.com/photo-1510511459019-5dda7724fd87') no-repeat center center/cover;
    height:100vh;
}

body::before{
    content:"";
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.7);
    z-index:-1;
}

.navbar{
    backdrop-filter:blur(10px);
    background:rgba(0,0,0,0.5)!important;
}

.main{
    display:flex;
    justify-content:center;
    padding:40px;
}

.accounts-container{
    width:95%;
    padding:30px;
    border-radius:20px;
    background:rgba(255,255,255,0.12);
    backdrop-filter:blur(15px);
    border:1px solid rgba(255,255,255,0.2);
    box-shadow:0 20px 40px rgba(0,0,0,0.6);
    color:white;
    animation:fadeIn 1s ease;
}

.accounts-container h4{
    font-weight:600;
    margin-bottom:20px;
}

.btn-dark{
    background:linear-gradient(45deg,#00f7ff,#0072ff);
    border:none;
    transition:0.3s;
}

.btn-dark:hover{
    transform:scale(1.05);
}

.table{
    color:white;
}

.table thead{
    background:rgba(0,0,0,0.5);
}

.table-hover tbody tr:hover{
    background:rgba(255,255,255,0.08);
}

.password-input{
    border:none;
    background:transparent;
    color:white;
    text-align:center;
    outline:none;
    width:120px;
}

.icon-btn{
    border:none;
    background:none;
    color:white;
    cursor:pointer;
    margin-left:5px;
}

#editBtn{
    border:none;
    background:#00c6ff;
    color:white;
    padding:6px 10px;
    border-radius:6px;
    margin-right:5px;
    cursor:pointer;
}

#deleteBtn{
    border:none;
    background:#ff4b2b;
    color:white;
    padding:6px 10px;
    border-radius:6px;
    cursor:pointer;
}

#editBtn:hover,#deleteBtn:hover{
    transform:scale(1.1);
}

@keyframes fadeIn{
    from{opacity:0; transform:translateY(-20px);}
    to{opacity:1; transform:translateY(0);}
}
</style>

<nav class="navbar navbar-expand-lg navbar-dark">
    <a class="navbar-brand ml-4" href="home.php">🔐 Secure Password Management System</a>
    <div class="form-inline my-2 my-lg-0 ml-auto">
        <div class="dropdown">
            <a class="nav-link dropdown-toggle link-unstyled" style="text-decoration: none; color: #eee;" href="#" role="button" data-toggle="dropdown">
                Welcome, <?php echo $user_name; ?>
            </a>
            <div class="dropdown-menu">
                <a class="dropdown-item" style="cursor:pointer;" onclick="view_user(<?php echo $user_id ?>)">View Account</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item text-danger" href="?logout=true"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
                <a class="dropdown-item text-primary" href="index.php"><i class="fa-solid fa-right-to-bracket"></i> Go to Login Page</a>
            </div>
        </div>
    </div>
</nav>

<div class="main">
<div class="accounts-container">

<h4 class="text-center"><strong><?php echo $user_name; ?>'s Accounts</strong></h4>

<button type="button" class="btn btn-dark mb-3 float-right" data-toggle="modal" data-target="#addAccountModal">
➕ Add Account
</button>

<input type="text" id="searchInput" class="form-control mb-3" placeholder="🔎 Search Account..." onkeyup="searchAccount()">

<div class="table-responsive">
<table class="table table-hover">
<thead class="text-center">
<tr>
<th>Serial</th>
<th>Account Name</th>
<th>Username</th>
<th>Password</th>
<th>URL</th>
<th>Description</th>
<th>Action</th>
</tr>
</thead>
<tbody class="text-center">
<?php 
$stmt = $conn->prepare("SELECT * FROM `tbl_accounts` WHERE tbl_user_id = :user_id ORDER BY tbl_account_id ASC");
$stmt->bindParam(':user_id', $user_id);
$stmt->execute();
$result = $stmt->fetchAll();

$serial = 1;
foreach ($result as $row) {
    $accountID = $row['tbl_account_id'];
    $accountName = $row['account_name'];
    $username = $row['username'];
    $password = $row['password'];
    $link = $row['link'];
    $description = $row['description'];
?>
<tr>
<td><?php echo $serial++; ?></td>
<td><?php echo $accountName; ?></td>
<td><?php echo $username; ?></td>
<td>
<input class="password-input" type="password" value="<?php echo $password; ?>" id="password-input-<?php echo $accountID; ?>" readonly>
<button class="icon-btn" onclick="togglePassword(<?php echo $accountID; ?>)"><i class="fa-solid fa-eye"></i></button>
<button class="icon-btn" onclick="copyPassword(<?php echo $accountID; ?>)"><i class="fa-solid fa-copy"></i></button>
</td>
<td><a href="<?php echo $link; ?>" target="_blank"><?php echo $link; ?></a></td>
<td><?php echo $description; ?></td>
<td>
<button id="editBtn" onclick="update_account(<?php echo $accountID; ?>)"><i class="fa-solid fa-pencil"></i></button>
<button id="deleteBtn" onclick="delete_account(<?php echo $accountID; ?>)"><i class="fa-solid fa-trash"></i></button>
</td>
</tr>
<?php } ?>
</tbody>
</table>
</div>
</div>
</div>

<script>
function togglePassword(id){
    let input = document.getElementById("password-input-"+id);
    input.type = (input.type === "password") ? "text" : "password";
}

function copyPassword(id){
    let input = document.getElementById("password-input-"+id);
    navigator.clipboard.writeText(input.value);
    alert("Password Copied!");
}

function searchAccount(){
    let input = document.getElementById("searchInput");
    let filter = input.value.toLowerCase();
    let table = document.querySelector("table");
    let tr = table.getElementsByTagName("tr");
    for(let i=1;i<tr.length;i++){
        let td = tr[i].getElementsByTagName("td")[1];
        if(td){
            let txt = td.textContent || td.innerText;
            tr[i].style.display = (txt.toLowerCase().indexOf(filter) > -1) ? "" : "none";
        }
    }
}

/* Auto Logout after 10 minutes */
let logoutTimer;
function resetTimer(){
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(function(){
        alert("Session Expired! Logging out...");
        window.location.href="home.php?logout=true";
    }, 600000);
}
window.onload = resetTimer;
document.onmousemove = resetTimer;
document.onkeypress = resetTimer;
</script>

<?php include('./partials/footer.php'); ?>