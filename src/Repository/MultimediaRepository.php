<?php

namespace App\Repository;

use App\Entity\Multimedia;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Multimedia|null find($id, $lockMode = null, $lockVersion = null)
 * @method Multimedia|null findOneBy(array $criteria, array $orderBy = null)
 * @method Multimedia[]    findAll()
 * @method Multimedia[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MultimediaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Multimedia::class);
    }

    // /**
    //  * @return Multimedia[] Returns an array of Multimedia objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('m.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Multimedia
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
    public function Guardar(Multimedia $Multimedia): Multimedia
    {
        $entitymanager = $this->getEntityManager();
        $entitymanager->persist($Multimedia);
        $entitymanager->flush();
        return $Multimedia;
    }

    public function findByArray($idproduct)
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u')
            ->andWhere("u.idproduct = :idproduct")->setParameter('idproduct', $idproduct);
        return $qb->getQuery()->getArrayResult();
    }
    public function Delete(Multimedia $Multimedia): Multimedia
    {
        $em = $this->getEntityManager();
        $em->remove($Multimedia);
        $em->flush();

        return $Multimedia;
    }

    public function updatePriority($idproduct,$idmultimedia)
    {
        $conn = $this->getEntityManager()->getConnection();
        $sql = <<<EOD
        UPDATE multimedia
        set priority = '0'
        WHERE 
        idproduct = $idproduct;
        UPDATE multimedia
        set priority = '1'
        WHERE
        idmultimedia = $idmultimedia
        EOD;

        $stmt = $conn->prepare($sql);
        $stmt->execute();

        return true;
    }
}
