<?php

// only work when we receive a post-request
if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    return;
}

$spidsLogPath = '/var/www/idslogs/'; // must end with a slash
$spidsFopenCallsNotToCheck = '/var/www/typo3temp';
$spidsFopenCallsNotToCheckLength = 18;

// configuration
define('IDS_LOG_FILE', $spidsLogPath.'ids.log');
define('IDS_POST_FOLDER', $spidsLogPath);
define('IDS_LOG_READ', false);

// rename internal functions for passing code
runkit_function_copy('fopen', 'ids_fopen');
runkit_function_copy('file_put_contents', 'ids_file_put_contents');

// define custom log function
function ids_log($message)
{
    $log = ids_fopen(IDS_LOG_FILE, 'a+');
    fwrite($log, date('d.m.Y G:i:') . microtime(true) . ' ' . $_SERVER['REMOTE_ADDR'] . ' ' . $message . "\n");
    fclose($log);
}
// redefine internal functions

// function fopen($filename, $mode, $use_include_path = false, $context = null) {}
runkit_function_redefine(
    'fopen',
    '$filename, $mode, $use_include_path = false, $context = null',
    <<<HEREDOC

    \$log = IDS_LOG_READ || \$mode{0} != 'r';
    \$log = \$log && substr(\$filename, 0, $spidsFopenCallsNotToCheckLength) !== '$spidsFopenCallsNotToCheck';

    if (\$log) {
        ids_log('fopen ' . getcwd() . ' ' . \$mode . ' ' . \$filename );
    }

    if (null === \$context) {
        return ids_fopen(\$filename, \$mode, \$use_include_path);
    } else {
        return ids_fopen(\$filename, \$mode, \$use_include_path, \$context);
    }
HEREDOC
);

// function file_put_contents($filename , $data, $flags = 0, $context = null) {}
runkit_function_redefine(
    'file_put_contents',
    '$filename, $data, $flags = 0, $context = null',
    <<<HEREDOC

    \$log = substr(\$filename, 0, $spidsFopenCallsNotToCheckLength) !== '$spidsFopenCallsNotToCheck';

    if (\$log) {
        ids_log('file_put_contents ' . getcwd() . ' ' . \$filename );
    }

    return ids_file_put_contents(\$filename, \$data, \$flags, \$context);
HEREDOC
);


// check for post-requests and log full post-data to logfile
if (isset($_SERVER['REQUEST_URI']) && isset($_SERVER['SCRIPT_NAME'])
    // ignore requests to /typo3 and /spids
    && !(substr($_SERVER['REQUEST_URI'], 0, 7) === '/typo3/' || substr($_SERVER['REQUEST_URI'], 0, 7) === '/spids/')
) {
    $filename = uniqid('post_');
    ids_log('POST ' . $filename . ' ' . $_SERVER['REQUEST_URI'] .  ' in script: ' . $_SERVER['SCRIPT_NAME']);
    if (count($_POST) === 0) {
        ids_file_put_contents(IDS_POST_FOLDER . $filename, print_r($_SERVER, 1));
    } else {
        ids_file_put_contents(IDS_POST_FOLDER . $filename, print_r($_POST, 1));
    }
}
