<?php

namespace App\Controller;

use App\Entity\Multimedia;
use App\Entity\Product;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class MultimediaController extends AbstractController
{

    public function priority(Request $request)
    {
        $productrepositoryinstance = $this
            ->getDoctrine()
            ->getRepository(Product::class);


        $multimediarepositoryinstace = $this
            ->getDoctrine()
            ->getRepository(Multimedia::class);

        dump($request);

        $idproduct = $request->request->get('idProducto');
        $idmultimedia = $request->request->get('idMultimedia');

        $multimediarepositoryinstace->updatePriority($idproduct,$idmultimedia);



        return new JsonResponse(array('objImg' => 'OKK'));
    }
    public function ajaxFind(Request $request)
    {
        $multimediaRepositoryInstance = $this->getDoctrine()->getRepository(Multimedia::class);

        $idproduct = $request->request->get('idproduct');

        /* Necesito esto porque lo devuelve de una manera que puedo acceder en el fronte end */
        $objImg = $multimediaRepositoryInstance->findByArray($idproduct);

        return new JsonResponse(array('objImg' => $objImg));
    }

    public function Guardar(Request $request)
    {
        $idProducto = $request->request->get('idproduct');
        $uplodedFile = $request->files->get('inputfileimg');
        $repoProduct = $this->getDoctrine()->getRepository(Product::class);
        $objProducto = $repoProduct->find($idProducto);
        $listProduct = $repoProduct->findAll();

        $rutaMove = "img/" . $idProducto;
        $rutaBBDD = "/img/" . $idProducto;

        $nombre = $uplodedFile->getClientOriginalName();
        $url = $rutaBBDD . "/" . $nombre;
        $imagenes = new Multimedia();
        $imagenes->setIdproduct($objProducto);
        $imagenes->setPriority("0");
        $imagenes->setUrl($url);

        $check = $uplodedFile->move($rutaMove, $nombre);

        $itemImagen = $this->getDoctrine()->getRepository(Multimedia::class)->Guardar($imagenes);

        return new JsonResponse(array('objImg' => $itemImagen));

    }
    public function Borrar(Request $request)
    {
        $idMultimedia = $request->request->get('idmultimedia');
        $repoMultimedia = $this->getDoctrine()->getRepository(Multimedia::class);
        $img = $repoMultimedia->find($idMultimedia);
        $ruta = "." . $img->getUrl();

        unlink($ruta);

        $repoMultimedia->Delete($img);

        return new JsonResponse(array('msj' => 'Fichero eliminado'));
    }
}
