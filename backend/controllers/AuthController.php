<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/JWT.php';
require_once __DIR__ . '/../lib/Response.php';

class AuthController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // POST /api/auth/register
    public function register(): never {
        $body = json_decode(file_get_contents('php://input'), true);

        $required = ['church_name', 'email', 'password', 'first_name', 'last_name'];
        foreach ($required as $f) {
            if (empty($body[$f])) Response::error("Field '$f' is required");
        }

        if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email address');
        }
        if (strlen($body['password']) < 8) {
            Response::error('Password must be at least 8 characters');
        }

        // Create church (tenant)
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                'INSERT INTO churches (name, slug, subscription_plan, created_at)
                 VALUES (?, ?, "starter", NOW())'
            );
            $slug = $this->slugify($body['church_name']);
            $stmt->execute([$body['church_name'], $slug]);
            $churchId = (int) $this->db->lastInsertId();

            // Create admin user
            $hash = password_hash($body['password'], PASSWORD_ARGON2ID);
            $stmt = $this->db->prepare(
                'INSERT INTO users (church_id, first_name, last_name, email, password_hash, role, created_at)
                 VALUES (?, ?, ?, ?, ?, "admin", NOW())'
            );
            $stmt->execute([
                $churchId,
                trim($body['first_name']),
                trim($body['last_name']),
                strtolower(trim($body['email'])),
                $hash,
            ]);
            $userId = (int) $this->db->lastInsertId();

            $this->db->commit();

            $token = $this->generateToken($userId, $churchId, 'admin');
            Response::success([
                'token'    => $token,
                'user'     => $this->safeUser($userId),
                'church'   => ['id' => $churchId, 'name' => $body['church_name']],
            ], 'Church registered successfully', 201);

        } catch (PDOException $e) {
            $this->db->rollBack();
            if ($e->getCode() === '23000') Response::error('Email already registered', 409);
            Response::error('Registration failed: ' . $e->getMessage(), 500);
        }
    }

    // POST /api/auth/login
    public function login(): never {
        $body = json_decode(file_get_contents('php://input'), true);
        if (empty($body['email']) || empty($body['password'])) {
            Response::error('Email and password are required');
        }

        $stmt = $this->db->prepare(
            'SELECT u.*, c.name AS church_name FROM users u
             JOIN churches c ON c.id = u.church_id
             WHERE u.email = ? AND u.is_active = 1 LIMIT 1'
        );
        $stmt->execute([strtolower(trim($body['email']))]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($body['password'], $user['password_hash'])) {
            Response::error('Invalid credentials', 401);
        }

        // Update last login
        $this->db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

        $token = $this->generateToken($user['id'], $user['church_id'], $user['role']);
        Response::success([
            'token' => $token,
            'user'  => [
                'id'         => $user['id'],
                'first_name' => $user['first_name'],
                'last_name'  => $user['last_name'],
                'email'      => $user['email'],
                'role'       => $user['role'],
            ],
            'church' => [
                'id'   => $user['church_id'],
                'name' => $user['church_name'],
            ],
        ]);
    }

    // GET /api/auth/me
    public function me(array $jwt): never {
        Response::success($this->safeUser($jwt['user_id']));
    }

    // POST /api/auth/change-password
    public function changePassword(array $jwt): never {
        $body = json_decode(file_get_contents('php://input'), true);
        if (empty($body['current_password']) || empty($body['new_password'])) {
            Response::error('current_password and new_password are required');
        }
        if (strlen($body['new_password']) < 8) {
            Response::error('New password must be at least 8 characters');
        }

        $stmt = $this->db->prepare('SELECT password_hash FROM users WHERE id = ?');
        $stmt->execute([$jwt['user_id']]);
        $user = $stmt->fetch();

        if (!password_verify($body['current_password'], $user['password_hash'])) {
            Response::error('Current password is incorrect', 401);
        }

        $this->db->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
            ->execute([password_hash($body['new_password'], PASSWORD_ARGON2ID), $jwt['user_id']]);

        Response::success(null, 'Password changed successfully');
    }

    // --- Helpers ---

    private function generateToken(int $userId, int $churchId, string $role): string {
        return JWT::encode([
            'user_id'   => $userId,
            'church_id' => $churchId,
            'roles'     => $role,
            'iat'       => time(),
            'exp'       => time() + JWT_EXPIRY,
        ], JWT_SECRET);
    }

    private function safeUser(int $userId): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, church_id, first_name, last_name, email, role, created_at, last_login FROM users WHERE id = ?'
        );
        $stmt->execute([$userId]);
        return $stmt->fetch() ?: null;
    }

    private function slugify(string $text): string {
        $text = preg_replace('/[^\w\s-]/', '', strtolower(trim($text)));
        return preg_replace('/[\s-]+/', '-', $text);
    }
}
