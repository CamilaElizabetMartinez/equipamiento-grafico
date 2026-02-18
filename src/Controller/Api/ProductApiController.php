<?php

namespace App\Controller\Api;

use App\Entity\Product;
use App\Entity\Categoria;
use App\Entity\Multimedia;
use App\Http\ApiResponse;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/products", name="api_products_")
 */
class ProductApiController extends AbstractController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Verifica si el usuario está autenticado
     */
    private function checkAuth(SessionInterface $session): ?JsonResponse
    {
        if (!$session->get('user_id')) {
            return ApiResponse::fail('No autenticado', null, 401);
        }
        return null;
    }
    /**
     * @Route("", name="list", methods={"GET"})
     * Pública - No requiere autenticación
     */
    public function getProducts(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Parámetros de paginación
        $page = max(1, (int)$request->query->get('page', 0));
        $limit = min(100, max(1, (int)$request->query->get('limit', 20)));
        $hasPagination = $request->query->has('page');

        $search = $request->query->get('search', '');
        $idcategoria = $request->query->get('idcategoria', null);

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

        $qb->orderBy('p.fechaAlta', 'DESC');

        // Obtener total antes de aplicar paginación
        $total = 0;
        if ($hasPagination) {
            $countQb = clone $qb;
            $countQb->select('COUNT(DISTINCT p.idproduct)');
            $total = (int)$countQb->getQuery()->getSingleScalarResult();

            // Aplicar paginación
            $offset = ($page - 1) * $limit;
            $qb->setFirstResult($offset)
               ->setMaxResults($limit);
        }

        $products = $qb->getQuery()->getResult();

        // Solución N+1: Cargar multimedia de todos los productos en una sola query
        $productIds = array_map(fn($p) => $p->getIdproduct(), $products);
        $multimediaMap = [];

        if (!empty($productIds)) {
            $multimediaResult = $em->getRepository(Multimedia::class)
                ->createQueryBuilder('m')
                ->where('m.idproduct IN (:ids)')
                ->setParameter('ids', $productIds)
                ->orderBy('m.priority', 'DESC')
                ->getQuery()
                ->getResult();

            // Agrupar multimedia por producto
            foreach ($multimediaResult as $m) {
                $pid = $m->getIdproduct()->getIdproduct();
                if (!isset($multimediaMap[$pid])) {
                    $multimediaMap[$pid] = [];
                }
                $multimediaMap[$pid][] = [
                    'id'       => $m->getIdmultimedia(),
                    'url'      => $m->getUrl(),
                    'priority' => $m->getPriority(),
                ];
            }
        }

        // Serializar productos
        $data = [];
        foreach ($products as $product) {
            $pid = $product->getIdproduct();

            $data[] = [
                'idproduct' => $pid,
                'titulo' => $product->getTitulo(),
                'descripcion' => $product->getDescripcion(),
                'precio' => (float) $product->getPrecio(),
                'fechaAlta' => $product->getFechaAlta() ? $product->getFechaAlta()->format('Y-m-d') : null,
                'idcategoria' => $product->getIdcategoria() ? [
                    'idcategoria' => $product->getIdcategoria()->getIdcategoria(),
                    'nombrecategoria' => $product->getIdcategoria()->getNombrecategoria(),
                    'nombre' => $product->getIdcategoria()->getNombrecategoria(),
                ] : null,
                'multimedia' => $multimediaMap[$pid] ?? [],
            ];
        }

        // Respuesta con o sin paginación según cliente
        if ($hasPagination) {
            return new JsonResponse([
                'data' => $data,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'totalPages' => (int)ceil($total / $limit),
                ]
            ], 200);
        } else {
            // Retrocompatibilidad: array directo sin wrapper
            return new JsonResponse($data, 200);
        }
    }

    /**
     * @Route("/test-upload", name="test_upload", methods={"POST"})
     */
    public function testUpload(Request $request): JsonResponse
    {
        try {
            $this->logger->info('Test upload request', [
                'files_count' => count($_FILES),
                'files_raw' => $_FILES,
                'request_files' => $request->files->all(),
                'content_type' => $request->headers->get('content-type'),
            ]);

            return new JsonResponse([
                'status' => 'test_ok', 
                'files' => $_FILES,
                'request_files' => $request->files->all(),
                'content_type' => $request->headers->get('content-type')
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Test upload error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @Route("/test-simple", name="test_simple", methods={"GET"})
     */
    public function testSimple(): JsonResponse
    {
        return new JsonResponse(['status' => 'simple_test_ok', 'timestamp' => time()]);
    }

    /**
     * @Route("/{id}/images", name="upload_image", methods={"POST"})
     */
    public function uploadImage(int $id, Request $request, EntityManagerInterface $em, SessionInterface $session): JsonResponse
    {
        try {
            if ($authError = $this->checkAuth($session)) {
                return $authError;
            }

            $product = $em->getRepository(Product::class)->find($id);
            if (!$product) {
                return ApiResponse::fail('Producto no encontrado', null, 404);
            }

            // Log para debugging
            $this->logger->info('Upload image request', [
                'product_id' => $id,
                'files_count' => count($_FILES),
                'files_keys' => array_keys($_FILES),
                'request_files' => $request->files->keys(),
                'content_type' => $request->headers->get('content-type'),
                '_FILES_raw' => $_FILES,
                'request_files_all' => $request->files->all(),
            ]);

            // Detectar errores de PHP antes de que Symfony procese los archivos
            if (isset($_FILES['image']['error']) && $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE => 'El archivo supera el tamaño máximo permitido por PHP (upload_max_filesize)',
                    UPLOAD_ERR_FORM_SIZE => 'El archivo supera el tamaño máximo permitido por el formulario',
                    UPLOAD_ERR_PARTIAL => 'El archivo se subió parcialmente',
                    UPLOAD_ERR_NO_FILE => 'No se subió ningún archivo',
                    UPLOAD_ERR_NO_TMP_DIR => 'Falta la carpeta temporal',
                    UPLOAD_ERR_CANT_WRITE => 'Error al escribir el archivo en disco',
                    UPLOAD_ERR_EXTENSION => 'Una extensión de PHP detuvo la subida del archivo',
                ];
                $error = $_FILES['image']['error'];
                $message = $errorMessages[$error] ?? "Error desconocido de subida: $error";
                $this->logger->error('PHP file upload error', ['error_code' => $error, 'message' => $message]);
                return ApiResponse::fail($message);
            }

            // Intentar obtener el archivo de diferentes formas
            $file = $request->files->get('image');
            
            // Si Symfony no puede procesar el archivo, intentamos con $_FILES directamente
            if (!$file instanceof \Symfony\Component\HttpFoundation\File\UploadedFile && isset($_FILES['image'])) {
                $this->logger->info('Symfony failed to process file, trying direct $_FILES approach');
                
                // Verificar que el archivo se subió correctamente
                if (!isset($_FILES['image']['tmp_name']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
                    return ApiResponse::fail('No se recibió un archivo válido.');
                }
                
                // Crear manualmente el objeto UploadedFile
                try {
                    $file = new \Symfony\Component\HttpFoundation\File\UploadedFile(
                        $_FILES['image']['tmp_name'],
                        $_FILES['image']['name'],
                        $_FILES['image']['type'],
                        $_FILES['image']['error'],
                        true
                    );
                } catch (\Exception $e) {
                    $this->logger->error('Failed to create UploadedFile manually', [
                        'error' => $e->getMessage(),
                        'files_data' => $_FILES['image']
                    ]);
                    return ApiResponse::fail('Error procesando el archivo subido.');
                }
            }

            // Log para debugging
            $this->logger->info('File object received', [
                'file_type' => gettype($file),
                'file_class' => is_object($file) ? get_class($file) : 'not_object',
                'is_uploaded_file' => $file instanceof \Symfony\Component\HttpFoundation\File\UploadedFile,
            ]);

            // Validar que tenemos un archivo válido
            if (!$file instanceof \Symfony\Component\HttpFoundation\File\UploadedFile) {
                $this->logger->error('Invalid file type received', [
                    'received_type' => gettype($file),
                    'received_class' => is_object($file) ? get_class($file) : 'not_object',
                ]);
                return ApiResponse::fail('No se recibió un archivo válido. Tipo de archivo no reconocido.');
            }

            if (!$file->isValid()) {
                $this->logger->error('File is not valid', [
                    'error' => $file->getError(),
                    'error_message' => $file->getErrorMessage(),
                ]);
                return ApiResponse::fail('El archivo recibido no es válido: ' . $file->getErrorMessage());
            }

            // Validar tipo de archivo
            $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            $fileMime = $file->getMimeType();
            if (!in_array($fileMime, $allowedMimes)) {
                $this->logger->error('Invalid file type', [
                    'mime_type' => $fileMime,
                    'allowed_types' => $allowedMimes,
                ]);
                return ApiResponse::fail('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WebP).');
            }

            // Crear directorio si no existe
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public_html/img/' . $id;
            if (!is_dir($uploadDir)) {
                if (!mkdir($uploadDir, 0755, true)) {
                    $this->logger->error('Failed to create upload directory', ['directory' => $uploadDir]);
                    return ApiResponse::fail('Error al crear el directorio de imágenes.');
                }
            }

            // Generar nombre de archivo
            $ext = $file->guessExtension() ?: $file->getClientOriginalExtension();
            $filename = uniqid('img_') . ($ext ? '.' . $ext : '.jpg');
            
            $this->logger->info('Moving file', [
                'original_name' => $file->getClientOriginalName(),
                'new_filename' => $filename,
                'upload_dir' => $uploadDir,
                'mime_type' => $fileMime,
            ]);

            // Mover archivo
            $file->move($uploadDir, $filename);

            $url = '/img/' . $id . '/' . $filename;

            // Guardar en base de datos
            $multimedia = new Multimedia();
            $multimedia->setIdproduct($product);
            $multimedia->setPriority(1);
            $multimedia->setUrl($url);

            $em->persist($multimedia);
            $em->flush();

            $this->logger->info('Image uploaded successfully', [
                'product_id' => $id,
                'filename' => $filename,
                'url' => $url,
            ]);

            return ApiResponse::success(['url' => $url], 'Imagen subida exitosamente', 201);

        } catch (\Exception $e) {
            $this->logger->error('Exception during image upload', [
                'product_id' => $id,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return ApiResponse::error('Error interno del servidor al subir la imagen');
        }
    }

    /**
     * @Route("/{id}", name="show", methods={"GET"})
     * Pública - No requiere autenticación
     */
    public function getProduct(int $id, EntityManagerInterface $em): JsonResponse
    {
        $product = $em->getRepository(Product::class)->find($id);

        if (!$product) {
            return ApiResponse::fail('Producto no encontrado', null, 404);
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
                    'id'       => $m->getIdmultimedia(),
                    'url'      => $m->getUrl(),
                    'priority' => $m->getPriority(),
                ];
            }, $multimedia),
        ];

        return ApiResponse::success($data);
    }

    /**
     * @Route("", name="create", methods={"POST"})
     */
    public function create(Request $request, EntityManagerInterface $em, SessionInterface $session): JsonResponse
    {
        if ($authError = $this->checkAuth($session)) {
            return $authError;
        }

        try {
            $data = json_decode($request->getContent(), true);
            $titulo = $data['titulo'] ?? $request->request->get('titulo');
            $descripcion = $data['descripcion'] ?? $request->request->get('descripcion', '');
            $precio = $data['precio'] ?? $request->request->get('precio');
            $idcategoria = $data['idcategoria'] ?? $request->request->get('idcategoria');

            if (empty($titulo) || empty($precio) || empty($idcategoria)) {
                return ApiResponse::fail('Datos incompletos');
            }

            $categoria = $em->getRepository(Categoria::class)->find($idcategoria);
            if (!$categoria) {
                return ApiResponse::fail('Categoría no encontrada', null, 404);
            }

            $product = new Product();
            $product->setTitulo($titulo);
            $product->setDescripcion($descripcion);
            $product->setPrecio((float) $precio);
            $product->setIdcategoria($categoria);
            $product->setFechaAlta(new \DateTime());

            $em->persist($product);
            $em->flush();

            // Cargar multimedia si existe
            $multimedia = $em->getRepository(Multimedia::class)
                ->findBy(['idproduct' => $product], ['priority' => 'DESC']);

            $productData = [
                'idproduct' => $product->getIdproduct(),
                'titulo' => $product->getTitulo(),
                'descripcion' => $product->getDescripcion(),
                'precio' => (float) $product->getPrecio(),
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

            $response = ApiResponse::success($productData, 'Producto creado exitosamente', 201);
            $response->headers->set('Location', '/api/products/' . $product->getIdproduct());

            return $response;
        } catch (\Exception $e) {
            $this->logger->error('Error creating product', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $session->get('user_id'),
                'request_data' => $data ?? null,
            ]);

            return ApiResponse::error('Error al crear producto');
        }
    }

    /**
     * @Route("/{id}", name="update", methods={"PUT", "PATCH"})
     */
    public function update(int $id, Request $request, EntityManagerInterface $em, SessionInterface $session): JsonResponse
    {
        if ($authError = $this->checkAuth($session)) {
            return $authError;
        }

        try {
            $product = $em->getRepository(Product::class)->find($id);
            if (!$product) {
                return ApiResponse::fail('Producto no encontrado', null, 404);
            }

            $data = json_decode($request->getContent(), true);
            $titulo = $data['titulo'] ?? null;
            $descripcion = $data['descripcion'] ?? null;
            $precio = $data['precio'] ?? null;
            $idcategoria = $data['idcategoria'] ?? null;

            if ($titulo) $product->setTitulo($titulo);
            if ($descripcion !== null) $product->setDescripcion($descripcion);
            if ($precio) $product->setPrecio((float) $precio);
            if ($idcategoria) {
                $categoria = $em->getRepository(Categoria::class)->find($idcategoria);
                if ($categoria) $product->setIdcategoria($categoria);
            }

            $em->flush();

            return ApiResponse::success(null, 'Producto actualizado exitosamente');
        } catch (\Exception $e) {
            $this->logger->error('Error updating product', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'product_id' => $id,
                'user_id' => $session->get('user_id'),
                'request_data' => $data ?? null,
            ]);

            return ApiResponse::error('Error al actualizar producto');
        }
    }

    /**
     * @Route("/{id}", name="delete", methods={"DELETE"})
     */
    public function delete(int $id, EntityManagerInterface $em, SessionInterface $session): JsonResponse
    {
        if ($authError = $this->checkAuth($session)) {
            return $authError;
        }

        try {
            $product = $em->getRepository(Product::class)->find($id);
            if (!$product) {
                return ApiResponse::fail('Producto no encontrado', null, 404);
            }

            $multimedia = $em->getRepository(Multimedia::class)->findBy(['idproduct' => $product]);
            foreach ($multimedia as $media) {
                $em->remove($media);
            }

            $em->remove($product);
            $em->flush();

            return ApiResponse::success(null, 'Producto eliminado exitosamente');
        } catch (\Exception $e) {
            $this->logger->error('Error deleting product', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'product_id' => $id,
                'user_id' => $session->get('user_id'),
            ]);

            return ApiResponse::error('Error al eliminar producto');
        }
    }

}
