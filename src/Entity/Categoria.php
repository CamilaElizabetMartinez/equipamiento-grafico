<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Categoria
 *
 * @ORM\Table(name="categoria")
 * @ORM\Entity(repositoryClass="App\Repository\CategoriaRepository")
 */
class Categoria
{
    /**
     * @var int
     *
     * @ORM\Column(name="idcategoria", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $idcategoria;

    /**
     * @var string
     *
     * @ORM\Column(name="nombrecategoria", type="string", length=45, nullable=false)
     */
    private $nombrecategoria;

    /**
     * @var string|null
     *
     * @ORM\Column(name="url", type="string", length=45, nullable=true)
     */
    private $url;

    public function getIdcategoria(): ?int
    {
        return $this->idcategoria;
    }

    public function getNombrecategoria(): ?string
    {
        return $this->nombrecategoria;
    }

    public function setNombrecategoria(string $nombrecategoria): self
    {
        $this->nombrecategoria = $nombrecategoria;

        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(?string $url): self
    {
        $this->url = $url;

        return $this;
    }

}
