<?php

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Input;

class PostController extends BaseController {

    protected $regularExpressionsFile = 'regularExpressions.yml';
    protected $regularExpressions = array();

    public function listFiles()
    {
        $files = glob(Config::get('app.dataDir') . Config::get('app.dataPostPattern'));

        return array_merge(
            array(
                file_exists(Config::get('app.liveDir')) ?
                array(
                    'name' => Config::get('app.liveDir'),
                    'mtime' => date('c', filemtime(Config::get('app.liveDir')))
                ) : array()
            ),
            array_map(
                function($file) {
                    return array(
                        'name' => basename($file),
                        'mtime' => date('c', filemtime($file))
                    );
                },
                $files
            )
        );
    }

    public function listPostDataFiles()
    {
        $tmp = $this->getTemporaryFolder(
            Input::get('archive')
        );

        $data = [];
        $r = fopen($tmp . '/ids.log', 'r');
        $cPos = 0;
        if ($r) while (false !== ($buffer = fgets($r, 4096))) {
            $d = explode(' ', $buffer);
            $data[] = array(
                $cPos,                  // ftell result     0
                $d[0] . ' ' . $d[1],    // date             1
                $d[2],                  // ip adress        2
                $d[4],                  // file name        3
                $d[5],                  // url              4
            );
            $cPos = ftell($r);
        }

        return $data;
    }

    public function addRegularExpression()
    {
        return $input = Input::all();
    }

    public function load() {
        $tmp = $this->getTemporaryFolder(
            Input::get('archive')
        );

        $r = fopen($tmp . '/ids.log', 'r');

        fseek($r, Input::get('seek'));

        $d = explode(' ', fgets($r, 4096));
        $file = $tmp . '/' . $d[4];
        if (file_exists($file)) {
            return file_get_contents($file);
        }

        return 'file not found :(';
    }

    public function calculateDanger() {
        if (0 === count($this->regularExpressions)) {
            $this->regularExpressions = \Symfony\Component\Yaml\Yaml::parse(Config::get('app.dataDir') . $this->regularExpressionsFile);
        }

        $tmp = $this->getTemporaryFolder(
            Input::get('archive')
        );

        $data = [];
        $r = fopen($tmp . '/ids.log', 'r');

        $seeks = Input::get('seeks');
        for ($i = 0; $i < count($seeks); $i++) {
            fseek($r, $seeks[$i]);
            $d = explode(' ', fgets($r, 4096));

            $matchedRules = [];

            foreach ($this->regularExpressions as $name => $rule) {
                if (!isset($rule['column'])
                    || !isset($rule['regexp'])
                    || !isset($rule['level'])
                ) {
                    continue;
                }

                $subject = null;

                switch ($rule['column']) {
                    case 'url':
                        $subject = $d[5];
                        break;
                    case 'date':
                        $subject = $d[0] . ' ' . $d[1];
                        break;
                    case 'ip':
                        $subject = $d[2];
                        break;
                    case 'data':
                        $postFile = $tmp . '/' . $d[4];
                        if (file_exists($postFile)) {
                            $subject = file_get_contents($postFile);
                        }
                        break;
                }

                if (null !== $subject) {
                    if (preg_match($rule['regexp'], $subject)) {
                        $matchedRules[] = array(
                            'name' => $name,
                            'level' => $rule['level'],
                            'post' => $postFile
                        );
                    } else {
                        $matchedRules[] = $postFile;
                    }
                } else {
                    $matchedRules[] = $postFile;
                }
            }

            $data[] = $matchedRules;
        }

        return $data;
    }

    private function getTemporaryFolder($archive) {
        $liveDir = Config::get('app.liveDir');
        if ($archive === $liveDir) {
            return $liveDir;
        }

        $base = Config::get('app.dataDir');
        $file = realpath($base . $archive);
        if (!file_exists(realpath($file)) || dirname($file) !== realpath($base)) {
            throw new \Symfony\Component\Routing\Exception\InvalidParameterException('Requested archive could not be found! ' . realpath($base));
        }
        $tmp = Config::get('app.tmpDir') . Config::get('app.tmpPrefix') .
               pathinfo(pathinfo($file)['filename'])['filename'];
        if (Config::get('app.forceOverwrite', true) || !file_exists($tmp)) {
            if (!file_exists($tmp)) {
                mkdir($tmp);
            }
            $code = 'tar -xjf ' . $file . ' -C ' . $tmp;

            $p = new \Symfony\Component\Process\Process($code);
            $p->run();

            if (!$p->isSuccessful()) {
                throw new \RuntimeException('Error extracting archive! ' . $p->getErrorOutput());
            }
        }
        return $tmp;
    }

}
