<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Response.php';

class MembersController {
    private PDO $db;
    private int $churchId;

    public function __construct(int $churchId) {
        $this->db = Database::getConnection();
        $this->churchId = $churchId;
    }

    // GET /api/members
    public function index(): never {
        $page    = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(100, max(10, (int) ($_GET['per_page'] ?? 20)));
        $search  = trim($_GET['search'] ?? '');
        $offset  = ($page - 1) * $perPage;

        $where = 'church_id = ?';
        $params = [$this->churchId];

        if ($search) {
            $where .= ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
            $s = "%$search%";
            array_push($params, $s, $s, $s);
        }

        $total = $this->db->prepare("SELECT COUNT(*) FROM members WHERE $where");
        $total->execute($params);
        $totalCount = (int) $total->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT id, first_name, last_name, email, phone, address, membership_status,
                    join_date, tithe_number, created_at
             FROM members WHERE $where ORDER BY last_name, first_name
             LIMIT $perPage OFFSET $offset"
        );
        $stmt->execute($params);

        Response::paginated($stmt->fetchAll(), $totalCount, $page, $perPage);
    }

    // GET /api/members/{id}
    public function show(int $id): never {
        $member = $this->findOrFail($id);

        // Attach giving summary
        $stmt = $this->db->prepare(
            'SELECT
               COALESCE(SUM(t.amount), 0) AS total_tithes,
               COALESCE((SELECT SUM(o.amount) FROM offerings o WHERE o.member_id = ? AND o.church_id = ?), 0) AS total_offerings
             FROM tithes t WHERE t.member_id = ? AND t.church_id = ?'
        );
        $stmt->execute([$id, $this->churchId, $id, $this->churchId]);
        $member['giving_summary'] = $stmt->fetch();

        Response::success($member);
    }

    // POST /api/members
    public function store(): never {
        $body = json_decode(file_get_contents('php://input'), true);
        $this->validateMember($body);

        $stmt = $this->db->prepare(
            'INSERT INTO members
             (church_id, first_name, last_name, email, phone, address,
              date_of_birth, membership_status, join_date, tithe_number, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
        );
        $stmt->execute([
            $this->churchId,
            trim($body['first_name']),
            trim($body['last_name']),
            strtolower(trim($body['email'] ?? '')),
            $body['phone'] ?? null,
            $body['address'] ?? null,
            $body['date_of_birth'] ?? null,
            $body['membership_status'] ?? 'active',
            $body['join_date'] ?? date('Y-m-d'),
            $body['tithe_number'] ?? null,
        ]);

        $id = (int) $this->db->lastInsertId();
        Response::success($this->findOrFail($id), 'Member created', 201);
    }

    // PUT /api/members/{id}
    public function update(int $id): never {
        $this->findOrFail($id);
        $body = json_decode(file_get_contents('php://input'), true);
        $this->validateMember($body, false);

        $this->db->prepare(
            'UPDATE members SET first_name=?, last_name=?, email=?, phone=?,
             address=?, date_of_birth=?, membership_status=?, tithe_number=?, updated_at=NOW()
             WHERE id=? AND church_id=?'
        )->execute([
            trim($body['first_name'] ?? ''),
            trim($body['last_name'] ?? ''),
            strtolower(trim($body['email'] ?? '')),
            $body['phone'] ?? null,
            $body['address'] ?? null,
            $body['date_of_birth'] ?? null,
            $body['membership_status'] ?? 'active',
            $body['tithe_number'] ?? null,
            $id,
            $this->churchId,
        ]);

        Response::success($this->findOrFail($id), 'Member updated');
    }

    // DELETE /api/members/{id}
    public function destroy(int $id): never {
        $this->findOrFail($id);
        $this->db->prepare('DELETE FROM members WHERE id=? AND church_id=?')
            ->execute([$id, $this->churchId]);
        Response::success(null, 'Member deleted');
    }

    // --- Helpers ---
    private function findOrFail(int $id): array {
        $stmt = $this->db->prepare('SELECT * FROM members WHERE id=? AND church_id=?');
        $stmt->execute([$id, $this->churchId]);
        $row = $stmt->fetch();
        if (!$row) Response::error('Member not found', 404);
        return $row;
    }

    private function validateMember(array $body, bool $strict = true): void {
        if ($strict && empty($body['first_name'])) Response::error('first_name is required');
        if ($strict && empty($body['last_name']))  Response::error('last_name is required');
    }
}
