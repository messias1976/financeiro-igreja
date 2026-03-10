<?php
/**
 * Front Controller — SanctuaryBooks API
 * Point your web server document root here, or configure .htaccess.
 */
header('Content-Type: application/json');
require_once __DIR__ . '/routes/api.php';
