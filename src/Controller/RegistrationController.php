<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Entity\Rol;
use App\Form\RegistrationFormType;
use App\Security\AuthCustomAuthenticator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Guard\GuardAuthenticatorHandler;

class RegistrationController extends AbstractController
{
    /**
     * @Route("/register", name="app_register")
     */
    public function register(Request $request, UserPasswordEncoderInterface $passwordEncoder, GuardAuthenticatorHandler $guardHandler, AuthCustomAuthenticator $authenticator): Response
    {
        $user = new Usuario();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // encode the plain password
            $user->setPasswordd(
                $passwordEncoder->encodePassword(
                    $user,
                    $_POST["registration_form"]["plainPassword"]
                    // $request->request->get('password')
                )
            );

            $email = $_POST["registration_form"]["email"];
            $nombre = $request->request->get('nombreusuario');
            $user->setNombreusuario($nombre);
            $rol=$this->getDoctrine()->getRepository(Rol::class)->find(1);
            $user->setIdrol($rol);
            $user->setEmail($email);
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($user);
            $entityManager->flush();
            // do anything else you need here, like send an email

            return $guardHandler->authenticateUserAndHandleSuccess(
                $user,
                $request,
                $authenticator,
                'main' // firewall name in security.yaml
            );
        }

        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form->createView(),
        ]);
    }
}
