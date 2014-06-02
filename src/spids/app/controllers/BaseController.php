<?php

use Symfony\Component\Process\Process;

class BaseController extends Controller {

	/**
	 * Setup the layout used by the controller.
	 *
	 * @return void
	 */
	protected function setupLayout()
	{
		if ( ! is_null($this->layout))
		{
			$this->layout = View::make($this->layout);
		}
	}

    public function clearTemporaryFolder() {
        /*
        // this method of clearing the cache is much to dangerous...
        $dirs = glob(Config::get('app.tmpDir') . Config::get('app.tmpPrefix') . '*');
        foreach ($dirs as $dir) {
            $p = new Process('rm -rf ' . $dir);
            $p->run();
        }
        */

        return 'done';
    }

}
