<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Response.php';

class ExpensesController {
    private PDO $db;
    private int $churchId;

    public function __construct(int $churchId) {
        $this->db = Database::getConnection();
        $this->churchId = $churchId;
    }

    // GET /api/expenses
    public function index(): never {
        $page     = max(1, (int) ($_GET['page'] ?? 1));
        $perPage  = min(100, max(10, (int) ($_GET['per_page'] ?? 20)));
        $offset   = ($page - 1) * $perPage;
        $category = $_GET['category'] ?? null;
        $status   = $_GET['status'] ?? null;
        $from     = $_GET['from'] ?? null;
        $to       = $_GET['to'] ?? null;

        $where  = 'church_id = ?';
        $params = [$this->churchId];

        if ($category) { $where .= ' AND category = ?'; $params[] = $category; }
        if ($status)   { $where .= ' AND status = ?'; $params[] = $status; }
        if ($from)     { $where .= ' AND expense_date >= ?'; $params[] = $from; }
        if ($to)       { $where .= ' AND expense_date <= ?'; $params[] = $to; }

        $total = $this->db->prepare("SELECT COUNT(*) FROM expenses WHERE $where");
        $total->execute($params);
        $totalCount = (int) $total->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT * FROM expenses WHERE $where
             ORDER BY expense_date DESC LIMIT $perPage OFFSET $offset"
        );
        $stmt->execute($params);

        Response::paginated($stmt->fetchAll(), $totalCount, $page, $perPage);
    }

    // POST /api/expenses
    public function store(): never {
        $body = json_decode(file_get_contents('php://input'), true);
        if (empty($body['description']))               Response::error('description is required');
        if (empty($body['amount']) || !is_numeric($body['amount'])) Response::error('Valid amount is required');
        if (empty($body['expense_date']))              Response::error('expense_date is required');
        if (empty($body['category']))                  Response::error('category is required');

        $this->db->prepare(
            'INSERT INTO expenses
             (church_id, description, amount, expense_date, category, vendor,
              payment_method, status, approved_by, receipt_url, notes, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
        )->execute([
            $this->churchId,
            trim($body['description']),
            round((float) $body['amount'], 2),
            $body['expense_date'],
            $body['category'],
            $body['vendor'] ?? null,
            $body['payment_method'] ?? 'bank_transfer',
            $body['status'] ?? 'pending',
            $body['approved_by'] ?? null,
            $body['receipt_url'] ?? null,
            $body['notes'] ?? null,
            $body['created_by'] ?? null,
        ]);

        Response::success(['id' => (int) $this->db->lastInsertId()], 'Expense recorded', 201);
    }

    // PUT /api/expenses/{id}/approve
    public function approve(int $id, int $approverId): never {
        $stmt = $this->db->prepare('SELECT id, status FROM expenses WHERE id=? AND church_id=?');
        $stmt->execute([$id, $this->churchId]);
        $expense = $stmt->fetch();
        if (!$expense) Response::error('Expense not found', 404);
        if ($expense['status'] === 'approved') Response::error('Expense already approved');

        $this->db->prepare(
            'UPDATE expenses SET status="approved", approved_by=?, approved_at=NOW(), updated_at=NOW() WHERE id=?'
        )->execute([$approverId, $id]);

        Response::success(null, 'Expense approved');
    }

    // GET /api/expenses/by-category
    public function byCategory(): never {
        $stmt = $this->db->prepare(
            'SELECT category, SUM(amount) AS total, COUNT(*) AS count
             FROM expenses WHERE church_id=? AND status="approved"
             GROUP BY category ORDER BY total DESC'
        );
        $stmt->execute([$this->churchId]);
        Response::success($stmt->fetchAll());
    }

    // DELETE /api/expenses/{id}
    public function destroy(int $id): never {
        $stmt = $this->db->prepare('SELECT id FROM expenses WHERE id=? AND church_id=?');
        $stmt->execute([$id, $this->churchId]);
        if (!$stmt->fetch()) Response::error('Expense not found', 404);

        $this->db->prepare('DELETE FROM expenses WHERE id=? AND church_id=?')->execute([$id, $this->churchId]);
        Response::success(null, 'Expense deleted');
    }
}
