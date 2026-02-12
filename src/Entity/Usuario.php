<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Usuario
 *
 * @ORM\Table(name="usuario", indexes={@ORM\Index(name="idrol", columns={"idrol"}), @ORM\Index(name="index2", columns={"idrol"})})
 * @ORM\Entity
 * @UniqueEntity(fields={"email"}, message="There is already an account with this email")
 */
class Usuario implements UserInterface, \Serializable
{
    /**
     * @var int
     *
     * @ORM\Column(name="idusuario", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $idusuario;

    /**
     * @var string
     *
     * @ORM\Column(name="nombreusuario", type="string", length=45, nullable=false)
     */
    private $nombreusuario;

    /**
     * @var string
     *
     * @ORM\Column(name="passwordd", type="string", length=10000, nullable=false)
     */
    private $passwordd;

    /**
     * @var string|null
     *
     * @ORM\Column(name="email", type="string", length=45, nullable=true)
     */
    private $email;

    /**
     * @var \Rol
     *
     * 
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\OneToOne(targetEntity="Rol")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="idrol", referencedColumnName="idrol")
     * })
     */
    private $idrol;

    public function getIdusuario(): ?int
    {
        return $this->idusuario;
    }

    public function getNombreusuario(): ?string
    {
        return $this->nombreusuario;
    }

    public function setNombreusuario(string $nombreusuario): self
    {
        $this->nombreusuario = $nombreusuario;

        return $this;
    }

    public function getPasswordd(): ?string
    {
        return $this->passwordd;
    }

    public function setPasswordd(string $passwordd): self
    {
        $this->passwordd = $passwordd;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getIdrol(): ?Rol
    {
        return $this->idrol;
    }

    public function setIdrol(?Rol $idrol): self
    {
        $this->idrol = $idrol;

        return $this;
    }
    /*---------------- Propiedades agregadas Siempre tiene qe llamarse asi--------------- */


    public function getPassword()
    {
        return $this->passwordd;
    }

    public function getUsername()
    {
        return $this->nombreusuario;
    }

    public function getSalt()
    {
        // you *may* need a real salt depending on your encoder
        // see section on salt below
        return null;
    }

    public function getRoles()
    {
        return array($this->idrol->getNombre());
    }

    public function eraseCredentials()
    {
    }

    /** @see \Serializable::serialize() */
    public function serialize()
    {
        return serialize(array(
            $this->idusuario,
            $this->nombreusuario,
            $this->passwordd,
            // see section on salt below
            // $this->salt,
        ));
    }

    /** @see \Serializable::unserialize() */
    public function unserialize($serialized)
    {
        list(
            $this->idusuario,
            $this->nombreusuario,
            $this->passwordd,
            // see section on salt below
            // $this->salt
        ) = unserialize($serialized, array('allowed_classes' => false));
    }

}
