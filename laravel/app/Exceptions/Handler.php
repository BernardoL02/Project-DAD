<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Throwable;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        // Se a exceção for de validação, retorna os erros como JSON
        if ($exception instanceof ValidationException) {
            return response()->json($exception->errors(), 422);
        }

        return parent::render($request, $exception);
    }
}
