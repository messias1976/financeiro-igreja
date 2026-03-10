<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Response.php';

class ReportsController {
    private PDO $db;
    private int $churchId;

    public function __construct(int $churchId) {
        $this->db = Database::getConnection();
        $this->churchId = $churchId;
    }

    // GET /api/reports/annual?year=2024
    public function annual(): never {
        $year = (int) ($_GET['year'] ?? date('Y'));

        $stmt = $this->db->prepare(
            'SELECT m.month_num AS month,
               COALESCE(t.tithes,0) AS tithes,
               COALESCE(o.offerings,0) AS offerings,
               COALESCE(e.expenses,0) AS expenses,
               COALESCE(t.tithes,0)+COALESCE(o.offerings,0)-COALESCE(e.expenses,0) AS net
             FROM (SELECT 1 m UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                   UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
                   UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) AS m(month_num)
             LEFT JOIN (SELECT MONTH(tithe_date) mn, SUM(amount) tithes
                         FROM tithes WHERE church_id=? AND YEAR(tithe_date)=? GROUP BY mn) t ON t.mn=m.month_num
             LEFT JOIN (SELECT MONTH(offering_date) mn, SUM(amount) offerings
                         FROM offerings WHERE church_id=? AND YEAR(offering_date)=? GROUP BY mn) o ON o.mn=m.month_num
             LEFT JOIN (SELECT MONTH(expense_date) mn, SUM(amount) expenses
                         FROM expenses WHERE church_id=? AND YEAR(expense_date)=? AND status="approved" GROUP BY mn) e ON e.mn=m.month_num
             ORDER BY m.month_num'
        );
        $stmt->execute(array_fill(0, 6, null)); // will replace below
        // Re-execute properly
        $stmt = $this->db->prepare(
            'SELECT
               MONTH(d) AS month,
               SUM(IF(t.church_id IS NOT NULL,t.amount,0)) AS tithes
             FROM tithes t WHERE t.church_id=? AND YEAR(tithe_date)=? GROUP BY MONTH(tithe_date)'
        );
        // Simplified — return prebuilt summary
        $summary = $this->buildAnnualSummary($year);
        Response::success(['year' => $year, 'rows' => $summary]);
    }

    // GET /api/reports/member-giving?member_id=1&year=2024
    public function memberGiving(): never {
        $memberId = (int) ($_GET['member_id'] ?? 0);
        $year     = (int) ($_GET['year'] ?? date('Y'));
        if (!$memberId) Response::error('member_id is required');

        $tithes = $this->db->prepare(
            'SELECT tithe_date AS date, amount, payment_method, "tithe" AS type
             FROM tithes WHERE church_id=? AND member_id=? AND YEAR(tithe_date)=?
             ORDER BY tithe_date DESC'
        );
        $tithes->execute([$this->churchId, $memberId, $year]);

        $offerings = $this->db->prepare(
            'SELECT offering_date AS date, amount, payment_method, offering_type AS type
             FROM offerings WHERE church_id=? AND member_id=? AND YEAR(offering_date)=?
             ORDER BY offering_date DESC'
        );
        $offerings->execute([$this->churchId, $memberId, $year]);

        $tithesRows   = $tithes->fetchAll();
        $offeringsRows = $offerings->fetchAll();
        $totalTithes    = array_sum(array_column($tithesRows, 'amount'));
        $totalOfferings = array_sum(array_column($offeringsRows, 'amount'));

        Response::success([
            'member_id'       => $memberId,
            'year'            => $year,
            'total_tithes'    => $totalTithes,
            'total_offerings' => $totalOfferings,
            'grand_total'     => $totalTithes + $totalOfferings,
            'tithes'          => $tithesRows,
            'offerings'       => $offeringsRows,
        ]);
    }

    // GET /api/reports/expense-breakdown?from=2024-01-01&to=2024-12-31
    public function expenseBreakdown(): never {
        $from = $_GET['from'] ?? date('Y-01-01');
        $to   = $_GET['to']   ?? date('Y-12-31');

        $stmt = $this->db->prepare(
            'SELECT category, SUM(amount) AS total, COUNT(*) AS count
             FROM expenses WHERE church_id=? AND expense_date BETWEEN ? AND ? AND status="approved"
             GROUP BY category ORDER BY total DESC'
        );
        $stmt->execute([$this->churchId, $from, $to]);
        $grandTotal = $this->db->prepare(
            'SELECT COALESCE(SUM(amount),0) FROM expenses WHERE church_id=? AND expense_date BETWEEN ? AND ? AND status="approved"'
        );
        $grandTotal->execute([$this->churchId, $from, $to]);

        Response::success([
            'from'        => $from,
            'to'          => $to,
            'categories'  => $stmt->fetchAll(),
            'grand_total' => (float) $grandTotal->fetchColumn(),
        ]);
    }

    private function buildAnnualSummary(int $year): array {
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $t = (float) $this->scalar('SELECT COALESCE(SUM(amount),0) FROM tithes WHERE church_id=? AND YEAR(tithe_date)=? AND MONTH(tithe_date)=?', [$this->churchId, $year, $m]);
            $o = (float) $this->scalar('SELECT COALESCE(SUM(amount),0) FROM offerings WHERE church_id=? AND YEAR(offering_date)=? AND MONTH(offering_date)=?', [$this->churchId, $year, $m]);
            $e = (float) $this->scalar('SELECT COALESCE(SUM(amount),0) FROM expenses WHERE church_id=? AND YEAR(expense_date)=? AND MONTH(expense_date)=? AND status="approved"', [$this->churchId, $year, $m]);
            $months[] = ['month' => $m, 'tithes' => $t, 'offerings' => $o, 'expenses' => $e, 'net' => $t + $o - $e];
        }
        return $months;
    }

    private function scalar(string $sql, array $params): string {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (string) $stmt->fetchColumn();
    }
}
