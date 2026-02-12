<?php

namespace App\Controller;

use Amp\Http\Client\Request as ClientRequest;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Product;
use App\Entity\Categoria;
use App\Entity\Multimedia;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ProductController extends AbstractController
{
    
    public function update($id)
    {
        $productrepositoryinstance = $this
            ->getDoctrine()
            ->getRepository(Product::class);

        $categoriarepositoryinstace = $this
            ->getDoctrine()
            ->getRepository(Categoria::class);
        $msj = "";

        $productInstance = $productrepositoryinstance->find($id);
        $categorias = $categoriarepositoryinstace->findAll();

        return $this->render('product/update.html.twig', [
            'product' => $productInstance,
            'categorias' => $categorias,
            'msj' => $msj,
        ]);
    }

    public function updatePost(Request $request)
    {
        $productrepositoryinstance = $this
            ->getDoctrine()
            ->getRepository(Product::class);

        $categoriarepositoryinstace = $this
            ->getDoctrine()
            ->getRepository(Categoria::class);

        $msj = "";
        $id = $request->request->get('idproduct');
        $titulo = $request->request->get('titulo');
        $descripcion = $request->request->get('descripcion');
        $precio = $request->request->get('precio');
        $idcategoria = $request->request->get('idcategoria');

        $productInstance = $productrepositoryinstance->find($id);
        $categoriainstace = $categoriarepositoryinstace->find($idcategoria);

        $productInstance->setTitulo($titulo);
        $productInstance->setDescripcion($descripcion);
        $productInstance->setPrecio($precio);
        $productInstance->setIdcategoria($categoriainstace);


        $nuevoProduct = $productrepositoryinstance->Guardar($productInstance);
        if ($nuevoProduct) $msj = "El producto se guardo Correctamente";

        $categorias = $categoriarepositoryinstace->findAll();

        return $this->render('product/update.html.twig', [
            'product' => $productInstance,
            'categorias' => $categorias,
            'msj' => $msj,
        ]);
    }

    public function all(Request $request)
    {
        $productdatainstace = $this
            ->getDoctrine()
            ->getRepository(Product::class);

        $categoriainstace = $this
            ->getDoctrine()
            ->getRepository(Categoria::class);

        $page = 1;
        //No logro agarrar lo que viene por GET

        $idcategoria  = $request->attributes->get("idcategoria");
        $sort = $request->attributes->get("sort");
        $search = $request->attributes->get("search");
        $page = $request->attributes->get("page");
        $forDropDown = "Ordenar Por";
        $categoriaunica = "";

        /* Aca va con $request  */
        if (!isset($search) && (empty($search))) {
            $search = "empty";
        }

        if (isset($idcategoria) && (!empty($idcategoria))) {
            //Para Filtro Categoria
            $forDropDown =  "";
            $categoriaunica = $categoriainstace->find($idcategoria);
        } else {
            $idcategoria = "0";
        }

        if (!isset($sort) && (empty($sort))) {
            $sort = 1;
        }
        if (!isset($page) && (empty($page))) {
            $page = 1;
        }

        $numRegisPos = 6; // Numero de objetos por pagina
        $pos = ($page * $numRegisPos) - $numRegisPos;

        /* Aca viene una Query que pregunte cuantos elementos total
         me trae de el registro no por paginas con todos los filtros ya*/
        $queryWithTotal = $productdatainstace->allforpagination($idcategoria, $search);
        $dataproductforrender = $productdatainstace->all($pos, $idcategoria, $sort, $search, $numRegisPos); //Se usa en la vista
        /* ACA!!!!!!!!!!!1 asiganar a a modelo el array qe viene !! */
        $numCatTotal = count($queryWithTotal); // Total objetos

        ///ME quede laburando aca me falla el recuento para la cantidad de paginas !!!
        //////////////////////////


        $numPaginas = ceil($numCatTotal / $numRegisPos); // Con ceil redondea par arriba
        $prev = 1;
        if ($page > 1) $prev = $page - 1;
        $next = $page;
        if ($page < $numPaginas) $next = $page + 1;

        $categorias = $categoriainstace->findAll(); //Se usa en la vista

        return $this->render('product/all.html.twig', [
            'dataproductforrender' => $dataproductforrender,
            'categorias' => $categorias,
            'forDropDown' => $forDropDown,
            'categoriaunica' => $categoriaunica,
            'numPaginas' => $numPaginas,
            'page' => $page,
            'next' => $next,
            'prev' => $prev,
            'idcategoria' => $idcategoria,
            'sort' => $sort,
            'search' => $search,
            'page' => $page,
        ]);
    }

    public function insertform(Request $request)
    {
        $productrepositoryinstance = $this
            ->getDoctrine()
            ->getRepository(Product::class);

        $categoriarepositoryinstace = $this
            ->getDoctrine()
            ->getRepository(Categoria::class);


        $multimediarepositoryinstace = $this
            ->getDoctrine()
            ->getRepository(Multimedia::class);


        /* Esta es la insercion en de el producto en la bbdd que va antes de la imagen porqe necesita el objeto producto para funcionar */
        /* Aca va con el request y con el set  */

        $productInstance = new Product();

        $msj = "";
        $upload = null;
        $titulo = $request->request->get('titulo');
        $descripcion = $request->request->get('descripcion');
        $precio = $request->request->get('precio');
        $idcategoria = $request->request->get('idcategoria');


        if (isset($titulo)) {
            $objCategoria = $categoriarepositoryinstace->find($idcategoria);

            $productInstance->setTitulo($titulo);
            $productInstance->setDescripcion($descripcion);
            $productInstance->setFechaAlta(new \DateTime);
            $productInstance->setIdcategoria($objCategoria);
            $productInstance->setPrecio($precio);


            /* Ver qe me devuelve nuevoProduct */
            $nuevoProduct = $productrepositoryinstance->Guardar($productInstance);
            if ($nuevoProduct) $msj = "El producto se guardo Correctamente";
        }


        $uplodedFile = $request->files->get('fichero');

        if ($uplodedFile != null) {
            $directorynumber = $nuevoProduct->getIdproduct();
            $directoryMove = "img/" . $directorynumber;
            $directoryBBDD = "img/" . $directorynumber;
            $priority = "1";
            foreach ($uplodedFile as $item) {
                $nombre = $item->getClientOriginalName();
                $url = $directoryBBDD . "/" . $nombre;
                $multimedia = new Multimedia();
                $multimedia->setIdproduct($nuevoProduct);/* NOSE SI ES ESTE*/
                $multimedia->setUrl($url);
                $multimedia->setPriority($priority);
                $upload = $item->move($directoryMove, $nombre);

                $itemImagen = $multimediarepositoryinstace->Guardar($multimedia);

                $priority = "0";
            }
        }


        $categorias = $categoriarepositoryinstace->findAll();

        return $this->render('product/insertform.html.twig', [
            'categorias' => $categorias,
            'msj' => $msj,
        ]);
    }

    public function modify(Request $request)
    {
        $productrepositoryinstance = $this
            ->getDoctrine()
            ->getRepository(Product::class);

        $categoriarepositoryinstace = $this
            ->getDoctrine()
            ->getRepository(Categoria::class);


        $idproductmodify = $request->request->get('idproductmodify');
        $titulo = $request->request->get('titulo');
        $descripcion = $request->request->get('descripcion');
        $precio = $request->request->get('precio');
        $idcategoria = $request->request->get('idcategoria');
        $showmodal = "";

        if (isset($idproductmodify) && !empty($idproductmodify)) {
            $productInstance = $productrepositoryinstance->find($idproductmodify);
            $categoriaInstance = $categoriarepositoryinstace->find($idcategoria);

            $productInstance->setDescripcion($descripcion);
            $productInstance->setPrecio($precio);
            $productInstance->setIdcategoria($categoriaInstance);
            $productInstance->setTitulo($titulo);

            $productrepositoryinstance->Guardar($productInstance);
            $showmodal = "Modificado con exito";
        }

        $dataproductforrender = $productrepositoryinstance->findAll();
        $categorias = $categoriarepositoryinstace->findAll();


        return $this->render('product/modify.html.twig', [
            'showmodal' => $showmodal,
            'dataproductforrender' => $dataproductforrender,
            'categorias' => $categorias,
        ]);
    }
    public function borrar(Request $request)
    {

        $productrepositoryinstance = $this
            ->getDoctrine()
            ->getRepository(Product::class);

        $multimediarepositoryinstace = $this
            ->getDoctrine()
            ->getRepository(Multimedia::class);


        $idproductdelete = $request->request->get('idproduct');
        $productInstance = $productrepositoryinstance->find($idproductdelete);
        $arrayImgToDelete = $multimediarepositoryinstace->findBy(["idproduct" => $productInstance]);
        foreach ($arrayImgToDelete as $value) {
            $multimediarepositoryinstace->Delete($value);
        }
        $productrepositoryinstance->Delete($productInstance);
        $realpathdirectorydelete = realpath("img/" . $idproductdelete);
        $check2 = array_map('unlink', glob("$realpathdirectorydelete/*.*"));
        $check = rmdir($realpathdirectorydelete);
        $showmodal = "Borrado con exito";

        return new JsonResponse(array('msj' => $showmodal));
    }

    public function detail($idproduct)
    {
        $productrepositoryinstance = $this
            ->getDoctrine()
            ->getRepository(Product::class);

        $multimediarepositoryinstace = $this
            ->getDoctrine()
            ->getRepository(Multimedia::class);

        $categoriarepositoryinstace = $this
            ->getDoctrine()
            ->getRepository(Categoria::class);

        $oneProduct = $productrepositoryinstance->find($idproduct);

        $forrenderimg = $multimediarepositoryinstace->findBy(["idproduct" => $oneProduct]);

        $idcategoria = $oneProduct->getIdcategoria();

        $categoryInstance = $categoriarepositoryinstace->find($idcategoria);

        return $this->render('product/detail.html.twig', [

            'oneProduct' => $oneProduct,
            'forrenderimg' => $forrenderimg,
            'categoryInstance' => $categoryInstance,
        ]);
    }
}
