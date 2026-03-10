-- ============================================================
--  SanctuaryBooks — Church Finance SaaS
--  MySQL Schema  |  Multi-tenant via church_id
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

-- ─── Drop Order ──────────────────────────────────────────────
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS offerings;
DROP TABLE IF EXISTS tithes;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS churches;

-- ─── 1. CHURCHES (Tenants) ───────────────────────────────────
CREATE TABLE churches (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(200) NOT NULL,
    slug              VARCHAR(200) NOT NULL UNIQUE,
    logo_url          VARCHAR(500),
    address           TEXT,
    phone             VARCHAR(30),
    email             VARCHAR(150),
    website           VARCHAR(300),
    subscription_plan ENUM('starter','parish','diocese') NOT NULL DEFAULT 'starter',
    subscription_ends DATE,
    is_active         TINYINT(1) NOT NULL DEFAULT 1,
    created_at        DATETIME NOT NULL,
    updated_at        DATETIME,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 2. USERS ────────────────────────────────────────────────
CREATE TABLE users (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    church_id     BIGINT UNSIGNED NOT NULL,
    first_name    VARCHAR(80) NOT NULL,
    last_name     VARCHAR(80) NOT NULL,
    email         VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('admin','treasurer','accountant','viewer') NOT NULL DEFAULT 'viewer',
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    last_login    DATETIME,
    created_at    DATETIME NOT NULL,
    updated_at    DATETIME,
    UNIQUE KEY uniq_email_church (email, church_id),
    FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 3. MEMBERS ──────────────────────────────────────────────
CREATE TABLE members (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    church_id         BIGINT UNSIGNED NOT NULL,
    first_name        VARCHAR(80) NOT NULL,
    last_name         VARCHAR(80) NOT NULL,
    email             VARCHAR(150),
    phone             VARCHAR(30),
    address           TEXT,
    date_of_birth     DATE,
    gender            ENUM('male','female','other'),
    marital_status    ENUM('single','married','divorced','widowed'),
    membership_status ENUM('active','inactive','visitor','transferred') NOT NULL DEFAULT 'active',
    join_date         DATE,
    tithe_number      VARCHAR(50),          -- unique giving ID per member
    photo_url         VARCHAR(500),
    notes             TEXT,
    created_at        DATETIME NOT NULL,
    updated_at        DATETIME,
    FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE,
    INDEX idx_church_members (church_id),
    INDEX idx_tithe_number (church_id, tithe_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 4. TITHES ───────────────────────────────────────────────
CREATE TABLE tithes (
    id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    church_id        BIGINT UNSIGNED NOT NULL,
    member_id        BIGINT UNSIGNED,                    -- NULL = anonymous
    amount           DECIMAL(15,2) NOT NULL,
    tithe_date       DATE NOT NULL,
    payment_method   ENUM('cash','bank_transfer','cheque','mobile_money','card','online') NOT NULL DEFAULT 'cash',
    reference_number VARCHAR(100),
    notes            TEXT,
    recorded_by      BIGINT UNSIGNED,                   -- user who entered the record
    created_at       DATETIME NOT NULL,
    updated_at       DATETIME,
    FOREIGN KEY (church_id)  REFERENCES churches(id)  ON DELETE CASCADE,
    FOREIGN KEY (member_id)  REFERENCES members(id)   ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id)    ON DELETE SET NULL,
    INDEX idx_church_tithes (church_id),
    INDEX idx_tithe_date    (church_id, tithe_date),
    INDEX idx_member_tithes (church_id, member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 5. OFFERINGS ────────────────────────────────────────────
CREATE TABLE offerings (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    church_id      BIGINT UNSIGNED NOT NULL,
    member_id      BIGINT UNSIGNED,
    amount         DECIMAL(15,2) NOT NULL,
    offering_date  DATE NOT NULL,
    offering_type  ENUM(
        'general','building_fund','missions','thanksgiving',
        'special','welfare','youth','children'
    ) NOT NULL DEFAULT 'general',
    campaign       VARCHAR(200),               -- named campaign / project
    payment_method ENUM('cash','bank_transfer','cheque','mobile_money','card','online') NOT NULL DEFAULT 'cash',
    notes          TEXT,
    recorded_by    BIGINT UNSIGNED,
    created_at     DATETIME NOT NULL,
    updated_at     DATETIME,
    FOREIGN KEY (church_id)  REFERENCES churches(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id)  REFERENCES members(id)  ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id)   ON DELETE SET NULL,
    INDEX idx_church_offerings  (church_id),
    INDEX idx_offering_date     (church_id, offering_date),
    INDEX idx_offering_type     (church_id, offering_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 6. EXPENSES ─────────────────────────────────────────────
CREATE TABLE expenses (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    church_id      BIGINT UNSIGNED NOT NULL,
    description    VARCHAR(500) NOT NULL,
    amount         DECIMAL(15,2) NOT NULL,
    expense_date   DATE NOT NULL,
    category       ENUM(
        'utilities','salaries','maintenance','equipment',
        'outreach','administration','welfare','events','other'
    ) NOT NULL DEFAULT 'other',
    vendor         VARCHAR(200),
    payment_method ENUM('cash','bank_transfer','cheque','mobile_money','card') NOT NULL DEFAULT 'cash',
    receipt_url    VARCHAR(500),
    status         ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    approved_by    BIGINT UNSIGNED,
    approved_at    DATETIME,
    notes          TEXT,
    created_by     BIGINT UNSIGNED,
    created_at     DATETIME NOT NULL,
    updated_at     DATETIME,
    FOREIGN KEY (church_id)  REFERENCES churches(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id)  ON DELETE SET NULL,
    FOREIGN KEY (created_by)  REFERENCES users(id)  ON DELETE SET NULL,
    INDEX idx_church_expenses  (church_id),
    INDEX idx_expense_date     (church_id, expense_date),
    INDEX idx_expense_status   (church_id, status),
    INDEX idx_expense_category (church_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Seed: Demo Church ────────────────────────────────────────
INSERT INTO churches (name, slug, subscription_plan, is_active, created_at)
VALUES ('Grace Community Church', 'grace-community', 'parish', 1, NOW());

-- Seed Admin user (password: Admin1234!)
INSERT INTO users (church_id, first_name, last_name, email, password_hash, role, is_active, created_at)
VALUES (1, 'Admin', 'User', 'admin@grace.church',
  '$argon2id$v=19$m=65536,t=4,p=1$...replace_with_real_hash...', 'admin', 1, NOW());

SET foreign_key_checks = 1;
