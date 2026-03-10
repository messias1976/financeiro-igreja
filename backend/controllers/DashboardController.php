<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Response.php';

class DashboardController {
    private PDO $db;
    private int $churchId;

    public function __construct(int $churchId) {
        $this->db = Database::getConnection();
        $this->churchId = $churchId;
    }

    // GET /api/dashboard
    public function summary(): never {
        $year  = (int) ($_GET['year']  ?? date('Y'));
        $month = (int) ($_GET['month'] ?? date('n'));

        // Current month totals
        $tithes = $this->scalar(
            'SELECT COALESCE(SUM(amount),0) FROM tithes WHERE church_id=? AND YEAR(tithe_date)=? AND MONTH(tithe_date)=?',
            [$this->churchId, $year, $month]
        );
        $offerings = $this->scalar(
            'SELECT COALESCE(SUM(amount),0) FROM offerings WHERE church_id=? AND YEAR(offering_date)=? AND MONTH(offering_date)=?',
            [$this->churchId, $year, $month]
        );
        $expenses = $this->scalar(
            'SELECT COALESCE(SUM(amount),0) FROM expenses WHERE church_id=? AND status="approved" AND YEAR(expense_date)=? AND MONTH(expense_date)=?',
            [$this->churchId, $year, $month]
        );

        // Year-to-date
        $ytdTithes = $this->scalar(
            'SELECT COALESCE(SUM(amount),0) FROM tithes WHERE church_id=? AND YEAR(tithe_date)=?',
            [$this->churchId, $year]
        );
        $ytdOfferings = $this->scalar(
            'SELECT COALESCE(SUM(amount),0) FROM offerings WHERE church_id=? AND YEAR(offering_date)=?',
            [$this->churchId, $year]
        );
        $ytdExpenses = $this->scalar(
            'SELECT COALESCE(SUM(amount),0) FROM expenses WHERE church_id=? AND status="approved" AND YEAR(expense_date)=?',
            [$this->churchId, $year]
        );

        // Member count
        $totalMembers = $this->scalar(
            'SELECT COUNT(*) FROM members WHERE church_id=? AND membership_status="active"',
            [$this->churchId]
        );

        // Monthly trend (12 months)
        $trend = $this->monthlyTrend($year);

        // Top givers this month
        $topGivers = $this->topGivers($year, $month);

        // Recent transactions
        $recent = $this->recentTransactions();

        Response::success([
            'period'        => compact('year', 'month'),
            'current_month' => [
                'tithes'    => (float) $tithes,
                'offerings' => (float) $offerings,
                'expenses'  => (float) $expenses,
                'net'       => (float) $tithes + (float) $offerings - (float) $expenses,
            ],
            'ytd' => [
                'tithes'    => (float) $ytdTithes,
                'offerings' => (float) $ytdOfferings,
                'expenses'  => (float) $ytdExpenses,
                'net'       => (float) $ytdTithes + (float) $ytdOfferings - (float) $ytdExpenses,
            ],
            'total_active_members' => (int) $totalMembers,
            'monthly_trend'        => $trend,
            'top_givers'           => $topGivers,
            'recent_transactions'  => $recent,
        ]);
    }

    private function monthlyTrend(int $year): array {
        $stmt = $this->db->prepare(
            'SELECT m.month_num,
               COALESCE(t.total, 0) AS tithes,
               COALESCE(o.total, 0) AS offerings,
               COALESCE(e.total, 0) AS expenses
             FROM (SELECT 1 AS month_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                   UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
                   UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) m
             LEFT JOIN (
               SELECT MONTH(tithe_date) AS mn, SUM(amount) AS total
               FROM tithes WHERE church_id=? AND YEAR(tithe_date)=? GROUP BY mn
             ) t ON t.mn = m.month_num
             LEFT JOIN (
               SELECT MONTH(offering_date) AS mn, SUM(amount) AS total
               FROM offerings WHERE church_id=? AND YEAR(offering_date)=? GROUP BY mn
             ) o ON o.mn = m.month_num
             LEFT JOIN (
               SELECT MONTH(expense_date) AS mn, SUM(amount) AS total
               FROM expenses WHERE church_id=? AND YEAR(expense_date)=? AND status="approved" GROUP BY mn
             ) e ON e.mn = m.month_num
             ORDER BY m.month_num'
        );
        $stmt->execute([$this->churchId, $year, $this->churchId, $year, $this->churchId, $year]);
        return $stmt->fetchAll();
    }

    private function topGivers(int $year, int $month): array {
        $stmt = $this->db->prepare(
            'SELECT CONCAT(m.first_name," ",m.last_name) AS name,
               COALESCE(SUM(t.amount),0)+COALESCE(SUM(o.amount),0) AS total
             FROM members m
             LEFT JOIN tithes t ON t.member_id=m.id AND t.church_id=m.church_id
                   AND YEAR(t.tithe_date)=? AND MONTH(t.tithe_date)=?
             LEFT JOIN offerings o ON o.member_id=m.id AND o.church_id=m.church_id
                   AND YEAR(o.offering_date)=? AND MONTH(o.offering_date)=?
             WHERE m.church_id=?
             GROUP BY m.id ORDER BY total DESC LIMIT 5'
        );
        $stmt->execute([$year, $month, $year, $month, $this->churchId]);
        return $stmt->fetchAll();
    }

    private function recentTransactions(): array {
        $stmt = $this->db->prepare(
            '(SELECT "tithe" AS type, t.amount, t.tithe_date AS tx_date,
               CONCAT(m.first_name," ",m.last_name) AS member_name, t.created_at
              FROM tithes t LEFT JOIN members m ON m.id=t.member_id WHERE t.church_id=?)
             UNION ALL
             (SELECT "offering", o.amount, o.offering_date, CONCAT(m.first_name," ",m.last_name), o.created_at
              FROM offerings o LEFT JOIN members m ON m.id=o.member_id WHERE o.church_id=?)
             UNION ALL
             (SELECT "expense", e.amount*-1, e.expense_date, e.description, e.created_at
              FROM expenses e WHERE e.church_id=? AND e.status="approved")
             ORDER BY created_at DESC LIMIT 10'
        );
        $stmt->execute([$this->churchId, $this->churchId, $this->churchId]);
        return $stmt->fetchAll();
    }

    private function scalar(string $sql, array $params): string {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (string) $stmt->fetchColumn();
    }
}
