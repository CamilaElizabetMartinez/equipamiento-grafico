<?php

namespace App\Controller\Api;

use App\Entity\Product;
use App\Entity\Multimedia;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/productos", name="api_productos_")
 */
class ProductApiController extends AbstractController
{
    /**
     * @Route("", name="list", methods={"GET"})
     */
    public function getProducts(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Configurar CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        $page = $request->query->get('page', 1);
        $search = $request->query->get('search', '');
        $idcategoria = $request->query->get('idcategoria', null);
        $limit = 12;
        $offset = ($page - 1) * $limit;

        $qb = $em->getRepository(Product::class)->createQueryBuilder('p')
            ->leftJoin('p.idcategoria', 'c')
            ->addSelect('c');

        // Filtro por búsqueda
        if (!empty($search)) {
            $qb->where('p.titulo LIKE :search OR p.descripcion LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        // Filtro por categoría
        if ($idcategoria) {
            $qb->andWhere('c.idcategoria = :idcategoria')
               ->setParameter('idcategoria', $idcategoria);
        }

        $qb->setFirstResult($offset)
           ->setMaxResults($limit)
           ->orderBy('p.fechaAlta', 'DESC');

        $products = $qb->getQuery()->getResult();

        // Serializar productos con multimedia
        $data = [];
        foreach ($products as $product) {
            $multimedia = $em->getRepository(Multimedia::class)
                ->findBy(['idproduct' => $product], ['priority' => 'DESC']);

            $data[] = [
                'idproduct' => $product->getIdproduct(),
                'titulo' => $product->getTitulo(),
                'descripcion' => $product->getDescripcion(),
                'precio' => $product->getPrecio(),
                'fechaAlta' => $product->getFechaAlta()->format('Y-m-d'),
                'idcategoria' => [
                    'idcategoria' => $product->getIdcategoria()->getIdcategoria(),
                    'nombre' => $product->getIdcategoria()->getNombrecategoria(),
                ],
                'multimedia' => array_map(function($m) {
                    return [
                        'url' => $m->getUrl(),
                        'priority' => $m->getPriority(),
                    ];
                }, $multimedia),
            ];
        }

        return $this->json($data);
    }

    /**
     * @Route("", name="options", methods={"OPTIONS"})
     */
    public function optionsProducts(): JsonResponse
    {
        return new JsonResponse(null, 200, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization',
        ]);
    }

    /**
     * @Route("/{id}", name="show", methods={"GET"})
     */
    public function getProduct(int $id, EntityManagerInterface $em): JsonResponse
    {
        // Configurar CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        $product = $em->getRepository(Product::class)->find($id);

        if (!$product) {
            return $this->json(['error' => 'Producto no encontrado'], 404);
        }

        $multimedia = $em->getRepository(Multimedia::class)
            ->findBy(['idproduct' => $product], ['priority' => 'DESC']);

        $data = [
            'idproduct' => $product->getIdproduct(),
            'titulo' => $product->getTitulo(),
            'descripcion' => $product->getDescripcion(),
            'precio' => $product->getPrecio(),
            'fechaAlta' => $product->getFechaAlta()->format('Y-m-d'),
            'idcategoria' => [
                'idcategoria' => $product->getIdcategoria()->getIdcategoria(),
                'nombre' => $product->getIdcategoria()->getNombrecategoria(),
            ],
            'multimedia' => array_map(function($m) {
                return [
                    'url' => $m->getUrl(),
                    'priority' => $m->getPriority(),
                ];
            }, $multimedia),
        ];

        return $this->json($data);
    }

    /**
     * @Route("/{id}", name="options_show", methods={"OPTIONS"})
     */
    public function optionsProduct(int $id): JsonResponse
    {
        return new JsonResponse(null, 200, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization',
        ]);
    }
}
