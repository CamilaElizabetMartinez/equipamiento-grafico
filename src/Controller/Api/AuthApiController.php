<?php

namespace App\Controller\Api;

use App\Entity\Usuario;
use App\Entity\Rol;
use Doctrine\ORM\EntityManagerInterface;
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
    /**
     * @Route("/login", name="login", methods={"POST", "OPTIONS"})
     */
    public function login(Request $request, UserPasswordEncoderInterface $passwordEncoder, EntityManagerInterface $em, SessionInterface $session): JsonResponse
    {
        // CORS
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 200, [
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'POST, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization',
                'Access-Control-Allow-Credentials' => 'true',
            ]);
        }

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            return new JsonResponse([
                'error' => 'Email y contraseña son requeridos'
            ], 400, [
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Credentials' => 'true',
            ]);
        }

        $usuario = $em->getRepository(Usuario::class)->findOneBy(['email' => $email]);

        if (!$usuario || !$passwordEncoder->isPasswordValid($usuario, $password)) {
            return new JsonResponse([
                'error' => 'Credenciales inválidas'
            ], 401, [
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Credentials' => 'true',
            ]);
        }

        // Guardar en sesión
        $session->set('user_id', $usuario->getIdusuario());
        $session->set('user_email', $usuario->getEmail());
        $session->set('user_name', $usuario->getNombreusuario());
        $session->set('user_role', $usuario->getIdrol()->getNombre());

        return new JsonResponse([
            'success' => true,
            'user' => [
                'id' => $usuario->getIdusuario(),
                'nombre' => $usuario->getNombreusuario(),
                'email' => $usuario->getEmail(),
                'rol' => $usuario->getIdrol()->getNombre(),
            ]
        ], 200, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Credentials' => 'true',
        ]);
    }

    /**
     * @Route("/register", name="register", methods={"POST", "OPTIONS"})
     */
    public function register(Request $request, UserPasswordEncoderInterface $passwordEncoder, EntityManagerInterface $em): JsonResponse
    {
        // CORS
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 200, [
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'POST, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization',
            ]);
        }

        $data = json_decode($request->getContent(), true);
        $nombre = $data['nombre'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($nombre) || empty($email) || empty($password)) {
            return new JsonResponse([
                'error' => 'Todos los campos son requeridos'
            ], 400, ['Access-Control-Allow-Origin' => '*']);
        }

        // Verificar si el email ya existe
        $existingUser = $em->getRepository(Usuario::class)->findOneBy(['email' => $email]);
        if ($existingUser) {
            return new JsonResponse([
                'error' => 'El email ya está registrado'
            ], 400, ['Access-Control-Allow-Origin' => '*']);
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

        return new JsonResponse([
            'success' => true,
            'message' => 'Usuario registrado correctamente',
            'user' => [
                'id' => $usuario->getIdusuario(),
                'nombre' => $usuario->getNombreusuario(),
                'email' => $usuario->getEmail(),
            ]
        ], 201, ['Access-Control-Allow-Origin' => '*']);
    }

    /**
     * @Route("/logout", name="logout", methods={"POST", "OPTIONS"})
     */
    public function logout(SessionInterface $session): JsonResponse
    {
        $session->clear();

        return new JsonResponse([
            'success' => true,
            'message' => 'Sesión cerrada correctamente'
        ], 200, ['Access-Control-Allow-Origin' => '*']);
    }

    /**
     * @Route("/me", name="me", methods={"GET", "OPTIONS"})
     */
    public function me(SessionInterface $session): JsonResponse
    {
        $userId = $session->get('user_id');

        if (!$userId) {
            return new JsonResponse([
                'authenticated' => false
            ], 401, ['Access-Control-Allow-Origin' => '*']);
        }

        return new JsonResponse([
            'authenticated' => true,
            'user' => [
                'id' => $userId,
                'nombre' => $session->get('user_name'),
                'email' => $session->get('user_email'),
                'rol' => $session->get('user_role'),
            ]
        ], 200, ['Access-Control-Allow-Origin' => '*']);
    }
}
