<?php

namespace App\Controller\Api;

use App\Entity\Usuario;
use App\Entity\Rol;
use App\Http\ApiResponse;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

/**
 * @Route("/api/auth", name="api_auth_")
 */
class AuthApiController extends AbstractController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * @Route("/login", name="login", methods={"POST"})
     */
    public function login(Request $request, UserPasswordEncoderInterface $passwordEncoder, EntityManagerInterface $em, SessionInterface $session): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';

            if (empty($email) || empty($password)) {
                return ApiResponse::fail('Email y contraseña son requeridos');
            }

            $usuario = $em->getRepository(Usuario::class)->findOneBy(['email' => $email]);

            if (!$usuario || !$passwordEncoder->isPasswordValid($usuario, $password)) {
                return ApiResponse::fail('Credenciales inválidas', null, 401);
            }

            // Guardar en sesión
            $session->set('user_id', $usuario->getIdusuario());
            $session->set('user_email', $usuario->getEmail());
            $session->set('user_name', $usuario->getNombreusuario());
            $session->set('user_role', $usuario->getIdrol()->getNombre());

            $userData = [
                'id' => $usuario->getIdusuario(),
                'nombre' => $usuario->getNombreusuario(),
                'email' => $usuario->getEmail(),
                'rol' => $usuario->getIdrol()->getNombre(),
            ];

            return ApiResponse::success($userData, 'Sesión iniciada exitosamente');
        } catch (\Exception $e) {
            $this->logger->error('Error during login', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $email ?? null,
            ]);

            return ApiResponse::error('Error al iniciar sesión');
        }
    }

    /**
     * @Route("/register", name="register", methods={"POST"})
     */
    public function register(Request $request, UserPasswordEncoderInterface $passwordEncoder, EntityManagerInterface $em): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $nombre = $data['nombre'] ?? '';
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';

            if (empty($nombre) || empty($email) || empty($password)) {
                return ApiResponse::fail('Todos los campos son requeridos');
            }

            // Verificar si el email ya existe
            $existingUser = $em->getRepository(Usuario::class)->findOneBy(['email' => $email]);
            if ($existingUser) {
                return ApiResponse::fail('El email ya está registrado');
            }

            $usuario = new Usuario();
            $usuario->setNombreusuario($nombre);
            $usuario->setEmail($email);
            $usuario->setPasswordd($passwordEncoder->encodePassword($usuario, $password));

            // Asignar rol por defecto (id 1)
            $rol = $em->getRepository(Rol::class)->find(1);
            $usuario->setIdrol($rol);

            $em->persist($usuario);
            $em->flush();

            $userData = [
                'id' => $usuario->getIdusuario(),
                'nombre' => $usuario->getNombreusuario(),
                'email' => $usuario->getEmail(),
            ];

            return ApiResponse::success($userData, 'Usuario registrado correctamente', 201);
        } catch (\Exception $e) {
            $this->logger->error('Error during registration', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $email ?? null,
                'nombre' => $nombre ?? null,
            ]);

            return ApiResponse::error('Error al registrar usuario');
        }
    }

    /**
     * @Route("/logout", name="logout", methods={"POST"})
     */
    public function logout(SessionInterface $session): JsonResponse
    {
        $session->clear();

        return ApiResponse::success(null, 'Sesión cerrada correctamente');
    }

    /**
     * @Route("/me", name="me", methods={"GET"})
     */
    public function me(SessionInterface $session): JsonResponse
    {
        $userId = $session->get('user_id');

        if (!$userId) {
            return ApiResponse::fail('No autenticado', null, 401);
        }

        $userData = [
            'id' => $userId,
            'nombre' => $session->get('user_name'),
            'email' => $session->get('user_email'),
            'rol' => $session->get('user_role'),
        ];

        return ApiResponse::success($userData);
    }
}
