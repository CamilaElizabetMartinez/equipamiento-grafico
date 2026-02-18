<?php

namespace App\Controller\Api;

use App\Entity\Categoria;
use App\Http\ApiResponse;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/categories", name="api_categories_")
 */
class CategoriaApiController extends AbstractController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Verifica si el usuario está autenticado
     */
    private function checkAuth(SessionInterface $session): ?JsonResponse
    {
        if (!$session->get('user_id')) {
            return ApiResponse::fail('No autenticado', null, 401);
        }
        return null;
    }
    /**
     * @Route("", name="list", methods={"GET"})
     * Pública - No requiere autenticación
     */
    public function list(EntityManagerInterface $em): JsonResponse
    {

        $categorias = $em->getRepository(Categoria::class)->findAll();

        $data = array_map(function($categoria) {
            return [
                'idcategoria' => $categoria->getIdcategoria(),
                'nombrecategoria' => $categoria->getNombrecategoria(),
            ];
        }, $categorias);

        return ApiResponse::success($data);
    }

    /**
     * @Route("", name="create", methods={"POST"})
     */
    public function create(Request $request, EntityManagerInterface $em, SessionInterface $session): JsonResponse
    {
        if ($authError = $this->checkAuth($session)) {
            return $authError;
        }

        try {
            $data = json_decode($request->getContent(), true);
            $nombre = $data['nombre'] ?? $request->request->get('nombre');

            if (empty($nombre)) {
                return ApiResponse::fail('El nombre es requerido');
            }

            $categoria = new Categoria();
            $categoria->setNombrecategoria($nombre);

            $em->persist($categoria);
            $em->flush();

            $categoriaData = [
                'idcategoria' => $categoria->getIdcategoria(),
                'nombrecategoria' => $categoria->getNombrecategoria(),
            ];

            $response = ApiResponse::success($categoriaData, 'Categoría creada exitosamente', 201);
            $response->headers->set('Location', '/api/categories/' . $categoria->getIdcategoria());

            return $response;
        } catch (\Exception $e) {
            $this->logger->error('Error creating category', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $session->get('user_id'),
                'request_data' => $data ?? null,
            ]);

            return ApiResponse::error('Error al crear categoría');
        }
    }

    /**
     * @Route("/{id}", name="update", methods={"PUT", "PATCH"})
     */
    public function update(int $id, Request $request, EntityManagerInterface $em, SessionInterface $session): JsonResponse
    {
        if ($authError = $this->checkAuth($session)) {
            return $authError;
        }

        try {
            $categoria = $em->getRepository(Categoria::class)->find($id);
            if (!$categoria) {
                return ApiResponse::fail('Categoría no encontrada', null, 404);
            }

            $data = json_decode($request->getContent(), true);
            $nombre = $data['nombre'] ?? null;

            if ($nombre) {
                $categoria->setNombrecategoria($nombre);
                $em->flush();
            }

            return ApiResponse::success(null, 'Categoría actualizada exitosamente');
        } catch (\Exception $e) {
            $this->logger->error('Error updating category', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'category_id' => $id,
                'user_id' => $session->get('user_id'),
                'request_data' => $data ?? null,
            ]);

            return ApiResponse::error('Error al actualizar categoría');
        }
    }

    /**
     * @Route("/{id}", name="delete", methods={"DELETE"})
     */
    public function delete(int $id, EntityManagerInterface $em, SessionInterface $session): JsonResponse
    {
        if ($authError = $this->checkAuth($session)) {
            return $authError;
        }

        try {
            $categoria = $em->getRepository(Categoria::class)->find($id);
            if (!$categoria) {
                return ApiResponse::fail('Categoría no encontrada', null, 404);
            }

            $em->remove($categoria);
            $em->flush();

            return ApiResponse::success(null, 'Categoría eliminada exitosamente');
        } catch (\Exception $e) {
            $this->logger->error('Error deleting category', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'category_id' => $id,
                'user_id' => $session->get('user_id'),
            ]);

            return ApiResponse::error('Error al eliminar categoría');
        }
    }

}
