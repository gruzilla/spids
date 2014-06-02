<?php

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Input;

class ChangedController extends BaseController
{

    public function listFiles()
    {
        $files = glob(
            Config::get('app.dataDir') . Config::get('app.dataChangedPattern')
        );

        return array_map(
            function ($file) {
                return array(
                    'name'  => basename($file),
                    'mtime' => date('c', filemtime($file))
                );
            },
            $files
        );
    }


    public function compareFiles()
    {
        $files = $input = Input::all();

        $f1 = $this->getTemporaryFolder($files[0]) . '/trip.txt';
        $f2 = $this->getTemporaryFolder($files[1]) . '/trip.txt';

        $p = new \Symfony\Component\Process\Process('diff ' . $f1 . ' ' . $f2);
        $p->run();
        $diff = explode("\n", $p->getOutput());

        $blocks = array();
        $block  = null;

        foreach ($diff as $line) {
            if (empty($line) || '---' === $line) {
                continue;
            }
            if ('>' === $line{0}) {
                // we have a block
                if (!isset($block['new'])) {
                    $block['new'] = '';
                }
                $block['new'] .= substr($line, 2) . "\n";
            } elseif ('<' === $line{0}) {
                // we have a block
                if (!isset($block['old'])) {
                    $block['old'] = '';
                }
                $block['old'] .= substr($line, 2) . "\n";
            } else {
                // we have a block description
                $matches = array();
                preg_match('#.*(a|d|c).*#', $line, $matches);

                if (0 === count($matches)) {
                    throw new \Symfony\Component\Routing\Exception\InvalidParameterException('Could not identify block: ' . $line);
                }

                // add old block
                if (null !== $block) {
                    $this->determineDangerLevel($block);
                    $blocks[] = $block;
                }

                $block = array(
                    'type' => $matches[1]
                );
            }
        }

        // add last block
        $this->determineDangerLevel($block);
        $blocks[] = $block;

        return $blocks;
    }


    private function determineDangerLevel(&$block)
    {
        if (isset($block['new']) && false !== strpos($block['new'], '.php')
            || isset($block['old']) && false !== strpos($block['old'], '.php')
        ) {
            $block['level'] = 'danger';
        }
    }

    private function getTemporaryFolder($archive) {

        $base = Config::get('app.dataDir');
        $file = realpath($base . '/' . $archive);
        if (!file_exists(realpath($file)) || dirname($file) !== realpath($base)) {
            throw new \Symfony\Component\Routing\Exception\InvalidParameterException('Requested archive could not be found! ' . $archive . ' | ' . dirname($file) . ' | ' . realpath($base));
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
