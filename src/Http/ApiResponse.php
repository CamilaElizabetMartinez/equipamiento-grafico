<?php
namespace App\Http;

use Symfony\Component\HttpFoundation\JsonResponse;

class ApiResponse
{
    public static function success($data = null, string $message = null, int $statusCode = 200): JsonResponse
    {
        $response = ['status' => 'success'];

        if ($data !== null) {
            $response['data'] = $data;
        }

        if ($message !== null) {
            $response['message'] = $message;
        }

        return new JsonResponse($response, $statusCode);
    }

    public static function fail(string $message, $errors = null, int $statusCode = 400): JsonResponse
    {
        $response = [
            'status' => 'fail',
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return new JsonResponse($response, $statusCode);
    }

    public static function error(string $message, string $code = null, int $statusCode = 500): JsonResponse
    {
        $response = [
            'status' => 'error',
            'message' => $message,
        ];

        if ($code !== null) {
            $response['code'] = $code;
        }

        return new JsonResponse($response, $statusCode);
    }
}
