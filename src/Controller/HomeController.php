<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Product;

class HomeController extends AbstractController
{

    public function index()
    {
        $productRepo = $this
            ->getDoctrine()
            ->getRepository(Product::class)
            ->viewhome();

        /* return $this->render('home/index.html.twig', [
            'productRepo' => $productRepo,
        ]); */
        
        return $this->render('home/indexNEW.html.twig', [
            'productRepo' => $productRepo,
        ]);
    }
    public function template()
    {
        return $this->render('home/template.html.twig', []);
    }
}
