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
        $array = [];
        //esta logica en algun momento la puedo pasar al controlador para dejar esto mas limpio
        $filtercampoOrden = "";
        if (!empty($sort)) {
            $campoOrden = "";
            switch ($sort) {
                case 1:
                    $campoOrden = "product.fecha_alta DESC";
                    break;
                case 2:
                    $campoOrden = "product.fecha_alta ASC";
                    break;
                case 3:
                    $campoOrden = "product.precio DESC";
                    break;
                case 4:
                    $campoOrden = "product.precio ASC";
                    break;
            }
            $filtercampoOrden = " ORDER BY $campoOrden ";
        }
        $filterpagination = "";
        if (!empty($pagination) | $pagination == "0") {
            $filterpagination = " LIMIT $pagination , $numRegisPos ";
        }
        $filtersearch = "";
        if (!empty($search) && $search != "empty") $filtersearch = " AND titulo LIKE '%" . $search . "%' ";
        $filtercategoria = "";
        if (!empty($idcategoria) && $idcategoria != "0") $filtercategoria = " AND product.idcategoria = $idcategoria  ";
        $conn = $this->getEntityManager()->getConnection();
        $sql = <<<EOD
        SELECT categoria.nombrecategoria , multimedia.priority , multimedia.url, product.idproduct, titulo, descripcion, precio, product.idcategoria, fecha_alta
        FROM product
        JOIN multimedia
        ON product.idproduct = multimedia.idproduct
        JOIN categoria
        ON product.idcategoria = categoria.idcategoria
        WHERE multimedia.priority  = 1
        AND titulo  != ""
        $filtercategoria
        $filtersearch
        $filtercampoOrden
        $filterpagination;        
        EOD;
        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery();

        $rows = $result->fetchAllAssociative();
        if (count($rows) > 0) {
            foreach ($rows as $value) {
                $card = new ProductModel();
                $card->nombre = $value["titulo"];
                $card->precio = $value["precio"];
                $card->descripcion = $value["descripcion"];
                $card->fecha_alta = $value["fecha_alta"];
                $card->url = $value["url"];
                $card->idproduct = $value["idproduct"];
                $card->nombrecategoria = $value["nombrecategoria"];
                $card->idcategoria = $value["idcategoria"];

                $array[] = $card;
            }
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
        $filterQueryCategoria = "";
        $filterQuerySearch = "";

        if (!empty($idcategoria) && $idcategoria != "0") $filterQueryCategoria =  " AND idcategoria = $idcategoria ";
        if (!empty($search) && $search != "empty") $filterQuerySearch = " AND product.titulo LIKE '$search' ";


        $conn = $this->getEntityManager()->getConnection();
        $sql = <<<EOD
        SELECT * FROM product
        JOIN multimedia
        ON product.idproduct = multimedia.idproduct
        WHERE multimedia.priority  = 1 
        AND titulo  != ""
        $filterQueryCategoria
        $filterQuerySearch
        EOD;
        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery();

        return $result->fetchAllAssociative();
    }

    public function Guardar(Product $product): Product
    {
        $entitymanager = $this->getEntityManager();
        $entitymanager->persist($product);
        $entitymanager->flush();
        return $product;
    }
}
