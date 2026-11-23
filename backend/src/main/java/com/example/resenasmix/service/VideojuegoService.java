package com.example.resenasmix.service;

import com.example.resenasmix.exception.ResourceNotFoundException;
import com.example.resenasmix.model.Categoria;
import com.example.resenasmix.model.Videojuego;
import com.example.resenasmix.repository.CategoriaRepository;
import com.example.resenasmix.repository.VideojuegoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VideojuegoService {
    private static final Logger log = LoggerFactory.getLogger(VideojuegoService.class);
    private final VideojuegoRepository repository;
    private final CategoriaRepository categoriaRepository;

    public VideojuegoService(VideojuegoRepository repository, CategoriaRepository categoriaRepository) {
        this.repository = repository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Videojuego> listar() { return repository.findAll(); }

    @Transactional(readOnly = true)
    public Videojuego obtenerPorId(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Videojuego no encontrado con id " + id));
    }

    @Transactional
    public Videojuego guardar(Videojuego videojuego) {
        asignarCategoria(videojuego);
        normalizarOferta(videojuego);
        log.debug("Guardando videojuego {}", videojuego.getTitulo());
        return repository.save(videojuego);
    }

    @Transactional
    public Videojuego actualizar(Long id, Videojuego datos) {
        Videojuego actual = obtenerPorId(id);
        actual.setTitulo(datos.getTitulo());
        actual.setConsola(datos.getConsola());
        actual.setGenero(datos.getGenero());
        String categoria = datos.getCategoria();
        if (categoria == null || categoria.isBlank()) categoria = datos.getGenero();
        actual.setCategoriaEntity(resolverCategoria(categoria));
        actual.setPrecio(datos.getPrecio());
        actual.setPrecioOferta(datos.getPrecioOferta());
        actual.setEnOferta(datos.getEnOferta());
        actual.setImagen(datos.getImagen());
        actual.setDescripcion(datos.getDescripcion());
        actual.setRequisitosMinimos(datos.getRequisitosMinimos());
        normalizarOferta(actual);
        log.debug("Actualizando videojuego id={}", id);
        return repository.save(actual);
    }

    @Transactional
    public void eliminar(Long id) {
        Videojuego videojuego = obtenerPorId(id);
        repository.delete(videojuego);
        log.debug("Eliminado videojuego id={}", id);
    }

    private void asignarCategoria(Videojuego videojuego) {
        String nombre = videojuego.getCategoria();
        if (nombre == null || nombre.isBlank()) nombre = videojuego.getGenero();
        videojuego.setCategoriaEntity(resolverCategoria(nombre));
    }

    private Categoria resolverCategoria(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }
        String limpio = nombre.trim();
        return categoriaRepository.findByNombreIgnoreCase(limpio)
                .orElseGet(() -> {
                    Categoria categoria = new Categoria();
                    categoria.setNombre(limpio);
                    return categoriaRepository.save(categoria);
                });
    }

    private void normalizarOferta(Videojuego videojuego) {
        if (videojuego.getEnOferta() == null) videojuego.setEnOferta(false);
        if (!videojuego.getEnOferta()) {
            videojuego.setPrecioOferta(null);
        } else if (videojuego.getPrecioOferta() == null || videojuego.getPrecioOferta().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Un videojuego en oferta debe tener un precio de oferta válido");
        } else if (videojuego.getPrecio() != null && videojuego.getPrecioOferta().compareTo(videojuego.getPrecio()) > 0) {
            throw new IllegalArgumentException("El precio de oferta no puede superar el precio normal");
        }
    }
}
