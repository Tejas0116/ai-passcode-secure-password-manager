<?php
include ('../conn/conn.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT `tbl_user_id`, `password` FROM `tbl_user` WHERE `username` = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch();
        $stored_password = $row['password'];
        $user_id = $row['tbl_user_id'];

        if ($password === $stored_password) {
            // Start a session and store the user ID
            session_start();
            $_SESSION['user_id'] = $user_id;

            echo "
            <script>
                alert('Login Successfully!');
                window.location.href = 'http://localhost/password-manager-app/home.php';
            </script>
            ";
        } else {
            echo "
            <script>
                alert('Login Failed, Incorrect Password!');
                window.location.href = 'http://localhost/password-manager-app/index.php';
            </script>
            ";
        }
    } else {
        echo "
            <script>
                alert('Login Failed, User Not Found!');
                window.location.href = 'http://localhost/password-manager-app/index.php';
            </script>
            ";
    }
}
?>
