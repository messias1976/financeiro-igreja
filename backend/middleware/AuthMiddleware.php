<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/JWT.php';

class AuthMiddleware {

    /**
     * Validate JWT token and return decoded payload.
     * Exits with 401 if token is missing or invalid.
     */
    public static function requireAuth(): array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s+(\S+)/', $authHeader, $m)) {
            self::unauthorized('Missing or malformed Authorization header');
        }

        try {
            $payload = JWT::decode($m[1], JWT_SECRET);
        } catch (Exception $e) {
            self::unauthorized($e->getMessage());
        }

        return $payload;
    }

    /**
     * Require a specific role (e.g., 'admin', 'treasurer').
     */
    public static function requireRole(string $role): array {
        $payload = self::requireAuth();
        if (!in_array($role, explode(',', $payload['roles'] ?? ''), true)) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit;
        }
        return $payload;
    }

    private static function unauthorized(string $message): never {
        http_response_code(401);
        echo json_encode(['error' => $message]);
        exit;
    }
}
