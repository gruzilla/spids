<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', 'HomeController@showWelcome');


Route::get('/changed', 'ChangedController@listFiles');

Route::post('/compare', 'ChangedController@compareFiles');

Route::get('/post', 'PostController@listFiles');

Route::post('/postFiles', 'PostController@listPostDataFiles');

Route::post('/calcDanger', 'PostController@calculateDanger');

Route::post('/load', 'PostController@load');

Route::post('/regular', 'PostController@addRegularExpression');

Route::get('/cleartmp', 'PostController@clearTemporaryFolder');
