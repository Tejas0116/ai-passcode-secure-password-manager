<?php
include ('../conn/conn.php');

session_start();

if (isset($_SESSION['user_id'])) {

$user_id = $_SESSION['user_id'];

if ($_SERVER["REQUEST_METHOD"] == "POST") {

$accountName = $_POST['account_name'];
$username = $_POST['username'];
$password = $_POST['password'];
$link = $_POST['link'];
$description = $_POST['description'];

try {

$stmt = $conn->prepare("SELECT username FROM tbl_accounts WHERE username = :username");
$stmt->execute(['username'=>$username]);

$userExists = $stmt->fetch(PDO::FETCH_ASSOC);

if(empty($userExists)){

$conn->beginTransaction();

$insertStmt=$conn->prepare("INSERT INTO tbl_accounts
(tbl_user_id,account_name,username,password,link,description)
VALUES
(:user_id,:account_name,:username,:password,:link,:description)");

$insertStmt->bindParam(':user_id',$user_id);
$insertStmt->bindParam(':account_name',$accountName);
$insertStmt->bindParam(':username',$username);
$insertStmt->bindParam(':password',$password);
$insertStmt->bindParam(':link',$link);
$insertStmt->bindParam(':description',$description);

$insertStmt->execute();

$conn->commit();

echo "
<script>
alert('Account Added Successfully');
window.location.href='http://localhost/password-manager-app/home.php';
</script>
";

}else{

echo "
<script>
alert('Username Already Exists');
window.location.href='http://localhost/password-manager-app/home.php';
</script>
";

}

}catch(PDOException $e){

echo "Error: ".$e->getMessage();

}

}

}
?>