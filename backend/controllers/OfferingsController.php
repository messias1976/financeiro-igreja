<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Response.php';

class OfferingsController {
    private PDO $db;
    private int $churchId;

    public function __construct(int $churchId) {
        $this->db = Database::getConnection();
        $this->churchId = $churchId;
    }

    // GET /api/offerings
    public function index(): never {
        $page    = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($_GET['per_page'] ?? 20)));
        $offset  = ($page - 1) * $perPage;
        $type    = $_GET['type'] ?? null;
        $from    = $_GET['from'] ?? null;
        $to      = $_GET['to'] ?? null;

        $where  = 'o.church_id = ?';
        $params = [$this->churchId];

        if ($type) { $where .= ' AND o.offering_type = ?'; $params[] = $type; }
        if ($from) { $where .= ' AND o.offering_date >= ?'; $params[] = $from; }
        if ($to)   { $where .= ' AND o.offering_date <= ?'; $params[] = $to; }

        $total = $this->db->prepare("SELECT COUNT(*) FROM offerings o WHERE $where");
        $total->execute($params);
        $totalCount = (int) $total->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT o.*, CONCAT(m.first_name,' ',m.last_name) AS member_name
             FROM offerings o
             LEFT JOIN members m ON m.id = o.member_id
             WHERE $where ORDER BY o.offering_date DESC
             LIMIT $perPage OFFSET $offset"
        );
        $stmt->execute($params);

        Response::paginated($stmt->fetchAll(), $totalCount, $page, $perPage);
    }

    // POST /api/offerings
    public function store(): never {
        $body = json_decode(file_get_contents('php://input'), true);
        if (empty($body['amount']) || !is_numeric($body['amount'])) Response::error('Valid amount is required');
        if (empty($body['offering_date'])) Response::error('offering_date is required');
        if (empty($body['offering_type'])) Response::error('offering_type is required');

        $stmt = $this->db->prepare(
            'INSERT INTO offerings
             (church_id, member_id, amount, offering_date, offering_type,
              campaign, payment_method, notes, recorded_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
        );
        $stmt->execute([
            $this->churchId,
            $body['member_id'] ?? null,
            round((float) $body['amount'], 2),
            $body['offering_date'],
            $body['offering_type'],
            $body['campaign'] ?? null,
            $body['payment_method'] ?? 'cash',
            $body['notes'] ?? null,
            $body['recorded_by'] ?? null,
        ]);

        Response::success(['id' => (int) $this->db->lastInsertId()], 'Offering recorded', 201);
    }

    // GET /api/offerings/by-type
    public function byType(): never {
        $stmt = $this->db->prepare(
            'SELECT offering_type, SUM(amount) AS total, COUNT(*) AS count
             FROM offerings WHERE church_id=?
             GROUP BY offering_type ORDER BY total DESC'
        );
        $stmt->execute([$this->churchId]);
        Response::success($stmt->fetchAll());
    }

    // DELETE /api/offerings/{id}
    public function destroy(int $id): never {
        $stmt = $this->db->prepare('SELECT id FROM offerings WHERE id=? AND church_id=?');
        $stmt->execute([$id, $this->churchId]);
        if (!$stmt->fetch()) Response::error('Offering not found', 404);

        $this->db->prepare('DELETE FROM offerings WHERE id=? AND church_id=?')->execute([$id, $this->churchId]);
        Response::success(null, 'Offering deleted');
    }
}
