<?php
include ('../conn/conn.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $phoneNumber = $_POST['phone_number'];
    $emailAddress = $_POST['email_address'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirm_password']; // Fixed input name


    try {
        $stmt = $conn->prepare("SELECT `username` FROM `tbl_user` WHERE `username` = :username");
        $stmt->execute([
            'username' => $username
        ]);
        $userExists = $stmt->fetch(PDO::FETCH_ASSOC);

        if (empty($userExists)) {
            $conn->beginTransaction();

            $insertStmt = $conn->prepare("INSERT INTO `tbl_user` (`tbl_user_id`, `name`, `phone_number`, `email_address`, `username`, `password`) VALUES (NULL, :name, :phone_number, :email_address, :username, :password)");
            $insertStmt->bindParam(':name', $name, PDO::PARAM_STR);
            $insertStmt->bindParam(':phone_number', $phoneNumber, PDO::PARAM_STR);
            $insertStmt->bindParam(':email_address', $emailAddress, PDO::PARAM_STR);
            $insertStmt->bindParam(':username', $username, PDO::PARAM_STR);
            $insertStmt->bindParam(':password', $password, PDO::PARAM_STR);
            $insertStmt->execute();

            echo "
            <script>
                alert('Registered Successfully');
                window.location.href = 'http://localhost/password-manager-app/index.php';
            </script>
            ";

            $conn->commit();
        } else {
            echo "
            <script>
                alert('User Already Exists');
                window.location.href = 'http://localhost/password-manager-app/index.php';
            </script>
            ";
        }
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }

} else {
    echo "
    <script>
        alert('Account Registration Failed!');
        window.location.href = 'http://localhost/password-manager-app/index.php';
    </script>
    ";
}
?>
