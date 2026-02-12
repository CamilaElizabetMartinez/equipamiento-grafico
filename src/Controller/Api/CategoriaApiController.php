<?php

namespace App\Controller\Api;

use App\Entity\Categoria;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/categorias", name="api_categorias_")
 */
class CategoriaApiController extends AbstractController
{
    /**
     * @Route("", name="list", methods={"GET"})
     */
    public function getCategories(EntityManagerInterface $em): JsonResponse
    {
        // Configurar CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        $categorias = $em->getRepository(Categoria::class)->findAll();

        $data = array_map(function($categoria) {
            return [
                'idcategoria' => $categoria->getIdcategoria(),
                'nombre' => $categoria->getNombrecategoria(),
                'descripcion' => $categoria->getNombrecategoria(),
            ];
        }, $categorias);

        return $this->json($data);
    }

    /**
     * @Route("", name="options", methods={"OPTIONS"})
     */
    public function optionsCategories(): JsonResponse
    {
        return new JsonResponse(null, 200, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization',
        ]);
    }
}
