<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Multimedia
 *
 * @ORM\Table(name="multimedia", indexes={@ORM\Index(name="product", columns={"idproduct"})})
 * @ORM\Entity(repositoryClass="App\Repository\MultimediaRepository")
 */
class Multimedia
{
    /**
     * @var int
     *
     * @ORM\Column(name="idmultimedia", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $idmultimedia;

    /**
     * @var string
     *
     * @ORM\Column(name="url", type="string", length=450, nullable=false)
     */
    private $url;

    /**
     * @var int
     *
     * @ORM\Column(name="priority", type="integer", nullable=false)
     */
    private $priority;

    /**
     * @var \Product
     *
     * @ORM\ManyToOne(targetEntity="Product")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="idproduct", referencedColumnName="idproduct")
     * })
     */
    private $idproduct;

    public function getIdmultimedia(): ?int
    {
        return $this->idmultimedia;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(string $url): self
    {
        $this->url = $url;

        return $this;
    }

    public function getPriority(): ?int
    {
        return $this->priority;
    }

    public function setPriority(int $priority): self
    {
        $this->priority = $priority;

        return $this;
    }

    public function getIdproduct(): ?Product
    {
        return $this->idproduct;
    }

    public function setIdproduct(?Product $idproduct): self
    {
        $this->idproduct = $idproduct;

        return $this;
    }


}
