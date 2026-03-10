<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Response.php';

class TithesController {
    private PDO $db;
    private int $churchId;

    public function __construct(int $churchId) {
        $this->db = Database::getConnection();
        $this->churchId = $churchId;
    }

    // GET /api/tithes
    public function index(): never {
        $page     = max(1, (int) ($_GET['page'] ?? 1));
        $perPage  = min(100, max(10, (int) ($_GET['per_page'] ?? 20)));
        $offset   = ($page - 1) * $perPage;
        $memberId = (int) ($_GET['member_id'] ?? 0);
        $from     = $_GET['from'] ?? null;
        $to       = $_GET['to'] ?? null;

        $where  = 't.church_id = ?';
        $params = [$this->churchId];

        if ($memberId) { $where .= ' AND t.member_id = ?'; $params[] = $memberId; }
        if ($from)     { $where .= ' AND t.tithe_date >= ?'; $params[] = $from; }
        if ($to)       { $where .= ' AND t.tithe_date <= ?'; $params[] = $to; }

        $total = $this->db->prepare("SELECT COUNT(*) FROM tithes t WHERE $where");
        $total->execute($params);
        $totalCount = (int) $total->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT t.*, CONCAT(m.first_name,' ',m.last_name) AS member_name
             FROM tithes t
             LEFT JOIN members m ON m.id = t.member_id
             WHERE $where ORDER BY t.tithe_date DESC
             LIMIT $perPage OFFSET $offset"
        );
        $stmt->execute($params);

        Response::paginated($stmt->fetchAll(), $totalCount, $page, $perPage);
    }

    // POST /api/tithes
    public function store(): never {
        $body = json_decode(file_get_contents('php://input'), true);
        if (empty($body['amount']) || !is_numeric($body['amount'])) Response::error('Valid amount is required');
        if (empty($body['tithe_date'])) Response::error('tithe_date is required');

        $stmt = $this->db->prepare(
            'INSERT INTO tithes
             (church_id, member_id, amount, tithe_date, payment_method, reference_number, notes, recorded_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())'
        );
        $stmt->execute([
            $this->churchId,
            $body['member_id'] ?? null,
            round((float) $body['amount'], 2),
            $body['tithe_date'],
            $body['payment_method'] ?? 'cash',
            $body['reference_number'] ?? null,
            $body['notes'] ?? null,
            $body['recorded_by'] ?? null,
        ]);

        $id = (int) $this->db->lastInsertId();
        Response::success(['id' => $id, ...$body], 'Tithe recorded', 201);
    }

    // PUT /api/tithes/{id}
    public function update(int $id): never {
        $this->findOrFail($id);
        $body = json_decode(file_get_contents('php://input'), true);

        $this->db->prepare(
            'UPDATE tithes SET member_id=?, amount=?, tithe_date=?, payment_method=?,
             reference_number=?, notes=?, updated_at=NOW()
             WHERE id=? AND church_id=?'
        )->execute([
            $body['member_id'] ?? null,
            round((float) $body['amount'], 2),
            $body['tithe_date'],
            $body['payment_method'] ?? 'cash',
            $body['reference_number'] ?? null,
            $body['notes'] ?? null,
            $id,
            $this->churchId,
        ]);

        Response::success($this->findOrFail($id), 'Tithe updated');
    }

    // DELETE /api/tithes/{id}
    public function destroy(int $id): never {
        $this->findOrFail($id);
        $this->db->prepare('DELETE FROM tithes WHERE id=? AND church_id=?')->execute([$id, $this->churchId]);
        Response::success(null, 'Tithe deleted');
    }

    // GET /api/tithes/summary
    public function summary(): never {
        $year = (int) ($_GET['year'] ?? date('Y'));
        $stmt = $this->db->prepare(
            'SELECT MONTH(tithe_date) AS month, SUM(amount) AS total, COUNT(*) AS count
             FROM tithes WHERE church_id=? AND YEAR(tithe_date)=?
             GROUP BY MONTH(tithe_date) ORDER BY month'
        );
        $stmt->execute([$this->churchId, $year]);
        Response::success(['year' => $year, 'monthly' => $stmt->fetchAll()]);
    }

    private function findOrFail(int $id): array {
        $stmt = $this->db->prepare('SELECT * FROM tithes WHERE id=? AND church_id=?');
        $stmt->execute([$id, $this->churchId]);
        $row = $stmt->fetch();
        if (!$row) Response::error('Tithe record not found', 404);
        return $row;
    }
}
