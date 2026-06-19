<?php
include('../conn/conn.php');

session_start();
if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $accountID = $_POST['tbl_account_id']; // Retrieve the account ID
        $accountName = $_POST['account_name'];
        $username = $_POST['username'];
        $password = $_POST['password'];
        $link = $_POST['link'];
        $description = $_POST['description'];

        try {
            $stmt = $conn->prepare("SELECT `username` FROM `tbl_accounts` WHERE `tbl_account_id` = :accountID AND `tbl_user_id` = :user_id");
            $stmt->execute([
                'accountID' => $accountID,
                'user_id' => $user_id
            ]);
            $accountExists = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!empty($accountExists)) {
                $conn->beginTransaction();

                $updateStmt = $conn->prepare("UPDATE `tbl_accounts` SET `account_name` = :account_name, `username` = :username, `password` = :password, `link` = :link, `description` = :description WHERE `tbl_account_id` = :accountID AND `tbl_user_id` = :user_id");
                $updateStmt->bindParam(':account_name', $accountName, PDO::PARAM_STR);
                $updateStmt->bindParam(':username', $username, PDO::PARAM_STR);
                $updateStmt->bindParam(':password', $password, PDO::PARAM_STR);
                $updateStmt->bindParam(':link', $link, PDO::PARAM_STR);
                $updateStmt->bindParam(':description', $description, PDO::PARAM_STR);
                $updateStmt->bindParam(':accountID', $accountID, PDO::PARAM_INT);
                $updateStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                $updateStmt->execute();

                echo "
                <script>
                    alert('Account Updated Successfully');
                    window.location.href = 'http://localhost/password-manager-app/home.php';
                </script>
                ";

                $conn->commit();
            } else {
                echo "
                <script>
                    alert('Account not found or does not belong to the current user');
                    window.location.href = 'http://localhost/password-manager-app/home.php';
                </script>
                ";
            }
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
        }
    } else {
        echo "
        <script>
            alert('Account Update Failed!');
            window.location.href = 'http://localhost/password-manager-app/home.php';
        </script>
        ";
    }
} else {
    echo "User not logged in. Please log in before updating an account.";
}
?>
