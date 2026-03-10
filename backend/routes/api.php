<?php
/**
 * API Router — SanctuaryBooks
 * All endpoints follow: /api/{resource}[/{id}][/{action}]
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../lib/JWT.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/MembersController.php';
require_once __DIR__ . '/../controllers/TithesController.php';
require_once __DIR__ . '/../controllers/OfferingsController.php';
require_once __DIR__ . '/../controllers/ExpensesController.php';
require_once __DIR__ . '/../controllers/DashboardController.php';
require_once __DIR__ . '/../controllers/ReportsController.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip /api prefix
$path   = preg_replace('#^/api#', '', $uri);
$parts  = array_values(array_filter(explode('/', trim($path, '/'))));

$resource = $parts[0] ?? '';
$id       = isset($parts[1]) && is_numeric($parts[1]) ? (int) $parts[1] : null;
$action   = $id ? ($parts[2] ?? null) : ($parts[1] ?? null);

// ─── Public Routes ───────────────────────────────────────────────────────────
if ($resource === 'auth') {
    $ctrl = new AuthController();
    match (true) {
        $method === 'POST' && $action === 'register'         => $ctrl->register(),
        $method === 'POST' && $action === 'login'            => $ctrl->login(),
        $method === 'GET'  && $action === 'me'               => $ctrl->me(AuthMiddleware::requireAuth()),
        $method === 'POST' && $action === 'change-password'  => $ctrl->changePassword(AuthMiddleware::requireAuth()),
        default => Response::error('Auth endpoint not found', 404),
    };
}

// ─── Protected Routes (JWT required) ─────────────────────────────────────────
$jwt = AuthMiddleware::requireAuth();
$churchId = (int) $jwt['church_id'];

match ($resource) {
    'dashboard' => (new DashboardController($churchId))->summary(),

    'members' => (function () use ($method, $id, $ctrl = new MembersController($churchId)) {
        match (true) {
            $method === 'GET'    && !$id  => $ctrl->index(),
            $method === 'GET'    && $id   => $ctrl->show($id),
            $method === 'POST'   && !$id  => $ctrl->store(),
            $method === 'PUT'    && $id   => $ctrl->update($id),
            $method === 'DELETE' && $id   => $ctrl->destroy($id),
            default => Response::error('Members endpoint not found', 404),
        };
    })(),

    'tithes' => (function () use ($method, $id, $action, $ctrl = new TithesController($churchId)) {
        match (true) {
            $method === 'GET'    && $action === 'summary' => $ctrl->summary(),
            $method === 'GET'    && !$id  => $ctrl->index(),
            $method === 'POST'   && !$id  => $ctrl->store(),
            $method === 'PUT'    && $id   => $ctrl->update($id),
            $method === 'DELETE' && $id   => $ctrl->destroy($id),
            default => Response::error('Tithes endpoint not found', 404),
        };
    })(),

    'offerings' => (function () use ($method, $id, $action, $ctrl = new OfferingsController($churchId)) {
        match (true) {
            $method === 'GET'    && $action === 'by-type' => $ctrl->byType(),
            $method === 'GET'    && !$id  => $ctrl->index(),
            $method === 'POST'   && !$id  => $ctrl->store(),
            $method === 'DELETE' && $id   => $ctrl->destroy($id),
            default => Response::error('Offerings endpoint not found', 404),
        };
    })(),

    'expenses' => (function () use ($method, $id, $action, $jwt, $ctrl = new ExpensesController($churchId)) {
        match (true) {
            $method === 'GET'    && $action === 'by-category' => $ctrl->byCategory(),
            $method === 'GET'    && !$id  => $ctrl->index(),
            $method === 'POST'   && !$id  => $ctrl->store(),
            $method === 'POST'   && $id && $action === 'approve' => $ctrl->approve($id, (int) $jwt['user_id']),
            $method === 'DELETE' && $id   => $ctrl->destroy($id),
            default => Response::error('Expenses endpoint not found', 404),
        };
    })(),

    'reports' => (function () use ($method, $action, $ctrl = new ReportsController($churchId)) {
        match (true) {
            $method === 'GET' && $action === 'annual'            => $ctrl->annual(),
            $method === 'GET' && $action === 'member-giving'     => $ctrl->memberGiving(),
            $method === 'GET' && $action === 'expense-breakdown' => $ctrl->expenseBreakdown(),
            default => Response::error('Reports endpoint not found', 404),
        };
    })(),

    default => Response::error('Resource not found', 404),
};
