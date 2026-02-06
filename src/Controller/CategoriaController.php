<?php

    namespace App\Controller;

use App\Entity\Categoria;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class CategoriaController extends AbstractController
{
    public function index($page)
    {
        $repo = $this->getDoctrine()->getRepository(Categoria::class);
        $categoria = $repo->findAll();

        //Para paginacion
        $numRegisPos = 10; // Numero de objetos por pagina
        if(!isset($page)) $page=1;
        $pos = ($page * $numRegisPos) - $numRegisPos; 
        $numCatTotal = count($categoria); // Total objetos
        $numPaginas = ceil($numCatTotal / $numRegisPos);// Con ceil redondea par arriba

        $prev = 1;
        if($page>1)$prev = $page-1;

        $next = $page;
        if($page<$numPaginas) $next = $page+1;

        $categoriaPaginacion = $repo->ListadoPaginacion($pos,$numRegisPos);

        return $this->render('categoria/index.html.twig', [
            'categoria' => $categoriaPaginacion,
            'page'=>$page,
            'numPag'=>$numPaginas,
            'prev'=>$prev,
            'next'=>$next,
        ]);
    }
    public function insertupdate($id)
    {
        $categoria = new Categoria();

        $getId = isset($id) && !empty($id);
        if ($getId) {
            $categoria = $this->getDoctrine()->getRepository(Categoria::class)->find($id);
        }
        return $this->render('categoria/insertupdate.html.twig', [
            'categoria' => $categoria,
            // 'mensaje'=> null,

        ]);
    }
    public function insertupdatepost(Request $request)
    {
        //guardar o editar dependiendo si viene ID
        $categoria = new Categoria();

        //Pregunto si viene la variable para saber si edito
        $getId = $request->request->get('id');

        //Si viene y no esta vacia trago el objeto
        if (isset($getId) && !empty($getId)) {
            $categoria = $this->getDoctrine()->getRepository(Categoria::class)->find($getId);
        }

        //Le asigno el nuevo nombre que viene por post al objeto 
        $categoria->setNombrecategoria($request->request->get('nombre'));

        //guardo el objeto con el nombre modifitcado o no
        $categoriaRepositoryManager = $this->getDoctrine()->getRepository(Categoria::class)->guardar($categoria);
        
        return $this->render('categoria/insertupdate.html.twig', [
            'categoria' => $categoria,
            'mensaje' => "Guardado Satisfatoriamente. Para crear uno nuevo, haga click en Nuevo.",
        ]);
    }
    public function delete($id)
    {
        $categoria = $this->getDoctrine()->getRepository(Categoria::class)->find($id);
        $categoriaRepositoryManager = $this->getDoctrine()->getRepository(Categoria::class)->Delete($categoria);

        return $this->redirectToRoute('Categoria');
    }

}
