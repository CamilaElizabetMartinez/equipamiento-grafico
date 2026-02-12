# Configuración del Backend Symfony - API REST

Instrucciones para convertir tu aplicación Symfony fullstack en una API REST pura.

## 📋 Pasos de Migración

### 1. Crear Controlador API para Productos

Crea o modifica `/src/Controller/Api/ProductApiController.php`:

```php
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
                    'nombre' => $product->getIdcategoria()->getNombre(),
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
     * @Route("/{id}", name="show", methods={"GET"})
     */
    public function getProduct(int $id, EntityManagerInterface $em): JsonResponse
    {
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
                'nombre' => $product->getIdcategoria()->getNombre(),
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
}
```

### 2. Crear Controlador API para Categorías

Crea `/src/Controller/Api/CategoriaApiController.php`:

```php
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
        $categorias = $em->getRepository(Categoria::class)->findAll();

        $data = array_map(function($categoria) {
            return [
                'idcategoria' => $categoria->getIdcategoria(),
                'nombre' => $categoria->getNombre(),
                'descripcion' => $categoria->getDescripcion(),
            ];
        }, $categorias);

        return $this->json($data);
    }
}
```

### 3. Configurar CORS

Instala el bundle CORS:

```bash
composer require nelmio/cors-bundle
```

Configura `/config/packages/nelmio_cors.yaml`:

```yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['http://localhost:5173']
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        allow_headers: ['Content-Type', 'Authorization', 'X-Requested-With']
        expose_headers: ['Link']
        max_age: 3600
    paths:
        '^/api/':
            allow_origin: ['*']
            allow_headers: ['*']
            allow_methods: ['POST', 'PUT', 'GET', 'DELETE', 'OPTIONS']
            max_age: 3600
```

### 4. Variables de Entorno

En `.env`:

```env
APP_ENV=dev
APP_SECRET=your-secret-key
DATABASE_URL="mysql://user:password@127.0.0.1:3306/equipamiento_grafico?serverVersion=5.7"
```

## 🚀 Iniciar el Backend

```bash
# Symfony Server
symfony server:start

# O PHP built-in server
php -S localhost:8000 -t public/
```

## ✅ Verificar Endpoints

Prueba con curl o Postman:

```bash
# Obtener productos
curl http://localhost:8000/api/productos

# Obtener categorías
curl http://localhost:8000/api/categorias

# Obtener un producto
curl http://localhost:8000/api/productos/1
```

## 📦 Estructura Final

```
equipamiento-grafico/
├── client/                    # Frontend React
│   ├── src/
│   ├── public/
│   └── package.json
├── src/                       # Backend Symfony
│   ├── Controller/
│   │   └── Api/              # Controladores API
│   ├── Entity/
│   └── Repository/
├── config/
├── public/
│   ├── img/                  # Imágenes de productos
│   └── index.php
└── composer.json
```

## 🐛 Troubleshooting

### CORS Error
- Verifica que nelmio/cors-bundle esté instalado
- Revisa la configuración en `config/packages/nelmio_cors.yaml`

### 404 en API
- Verifica que las rutas estén correctamente definidas
- Limpia el cache: `php bin/console cache:clear`

### Imágenes no cargan
- Verifica que la carpeta `public/img/` exista
- Asegúrate de que las rutas en la BD sean relativas: `img/1/producto.jpg`
