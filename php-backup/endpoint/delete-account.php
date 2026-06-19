<?php
include('../conn/conn.php');

session_start();
if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];

    if (isset($_GET['account'])) {
        $accountID = $_GET['account'];

        try {
            $stmt = $conn->prepare("SELECT `tbl_account_id` FROM `tbl_accounts` WHERE `tbl_account_id` = :accountID AND `tbl_user_id` = :user_id");
            $stmt->execute([
                'accountID' => $accountID,
                'user_id' => $user_id
            ]);
            $accountExists = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!empty($accountExists)) {
                $conn->beginTransaction();

                $deleteStmt = $conn->prepare("DELETE FROM `tbl_accounts` WHERE `tbl_account_id` = :accountID AND `tbl_user_id` = :user_id");
                $deleteStmt->bindParam(':accountID', $accountID, PDO::PARAM_INT);
                $deleteStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                $deleteStmt->execute();

                $conn->commit();
                echo "
                <script>
                    alert('Account Deleted Successfully');
                    window.location.href = 'http://localhost/password-manager-app/home.php';
                </script>
                ";
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
            alert('Invalid request. Please select an account to delete.');
            window.location.href = 'http://localhost/password-manager-app/home.php';
        </script>
        ";
    }
} else {
    echo "
    <script>
            alert('User not logged in. Please log in before deleting an account.');
            window.location.href = 'http://localhost/password-manager-app/index.php';
    </script>
    ";
    
}
?>
