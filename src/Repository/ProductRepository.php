<?php

namespace App\Repository;

use App\vm\ProductModel;
use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Product|null find($id, $lockMode = null, $lockVersion = null)
 * @method Product|null findOneBy(array $criteria, array $orderBy = null)
 * @method Product[]    findAll()
 * @method Product[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    // /**
    //  * @return Product[] Returns an array of Product objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('p.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Product
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */

    function all($pagination = 1, $idcategoria = "", $sort = "", $search = "", $numRegisPos = 0)
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.idcategoria', 'c')
            ->addSelect('c')
            ->where("p.titulo != ''");

        // Filtro categoría SEGURO
        if (!empty($idcategoria) && $idcategoria != "0") {
            $qb->andWhere('c.idcategoria = :idcategoria')
               ->setParameter('idcategoria', $idcategoria);
        }

        // Filtro búsqueda SEGURO
        if (!empty($search) && $search != "empty") {
            $qb->andWhere('p.titulo LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        // Ordenamiento con whitelist (previene SQL injection)
        $orderMap = [
            1 => ['p.fechaAlta', 'DESC'],
            2 => ['p.fechaAlta', 'ASC'],
            3 => ['p.precio', 'DESC'],
            4 => ['p.precio', 'ASC'],
        ];
        if (isset($orderMap[$sort])) {
            $qb->orderBy($orderMap[$sort][0], $orderMap[$sort][1]);
        }

        // Paginación SEGURA
        if (!empty($pagination) || $pagination === "0") {
            $qb->setFirstResult((int)$pagination)
               ->setMaxResults((int)$numRegisPos);
        }

        $results = $qb->getQuery()->getResult();

        // Convertir a ProductModel para mantener compatibilidad
        $array = [];
        foreach ($results as $product) {
            // Obtener multimedia prioritaria
            $multimedia = $this->getEntityManager()
                ->getRepository(\App\Entity\Multimedia::class)
                ->findOneBy(['idproduct' => $product, 'priority' => 1]);

            $card = new ProductModel();
            $card->nombre = $product->getTitulo();
            $card->precio = $product->getPrecio();
            $card->descripcion = $product->getDescripcion();
            $card->fecha_alta = $product->getFechaAlta() ? $product->getFechaAlta()->format('Y-m-d H:i:s') : null;
            $card->url = $multimedia ? $multimedia->getUrl() : null;
            $card->idproduct = $product->getIdproduct();
            $card->nombrecategoria = $product->getIdcategoria() ? $product->getIdcategoria()->getNombrecategoria() : null;
            $card->idcategoria = $product->getIdcategoria() ? $product->getIdcategoria()->getIdcategoria() : null;

            $array[] = $card;
        }

        return $array;
    }

    public function Delete(Product $product): Product
    {
        $em = $this->getEntityManager();
        $em->remove($product);
        $em->flush();

        return $product;
    }
    public function viewhome(): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $sql = <<<EOD
        SELECT multimedia.priority , multimedia.url, product.idproduct, titulo, descripcion, precio, idcategoria, fecha_alta
        FROM product
        JOIN multimedia
        ON product.idproduct = multimedia.idproduct
        WHERE multimedia.priority  = 1
        ORDER BY fecha_alta DESC
        LIMIT 6;
        EOD;
        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery();

        return $result->fetchAllAssociative();
    }

    public function allforpagination($idcategoria, $search)
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.idcategoria', 'c')
            ->addSelect('c')
            ->where("p.titulo != ''");

        // Filtro categoría SEGURO
        if (!empty($idcategoria) && $idcategoria != "0") {
            $qb->andWhere('p.idcategoria = :idcategoria')
               ->setParameter('idcategoria', $idcategoria);
        }

        // Filtro búsqueda SEGURO
        if (!empty($search) && $search != "empty") {
            $qb->andWhere('p.titulo LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        // Devolver todos los resultados que coincidan
        return $qb->getQuery()->getResult();
    }

    public function Guardar(Product $product): Product
    {
        $entitymanager = $this->getEntityManager();
        $entitymanager->persist($product);
        $entitymanager->flush();
        return $product;
    }
}
