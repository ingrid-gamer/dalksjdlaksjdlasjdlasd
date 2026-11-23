package com.example.resenasmix.service;

import com.example.resenasmix.dto.CompraRequestDTO;
import com.example.resenasmix.dto.CompraResponseDTO;
import com.example.resenasmix.dto.DetalleBoletaResponseDTO;
import com.example.resenasmix.exception.ResourceNotFoundException;
import com.example.resenasmix.model.Compra;
import com.example.resenasmix.model.DetalleBoleta;
import com.example.resenasmix.model.Usuario;
import com.example.resenasmix.model.Videojuego;
import com.example.resenasmix.repository.VideojuegoRepository;
import com.example.resenasmix.repository.CompraRepository;
import com.example.resenasmix.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class CompraService {
    private static final Logger log = LoggerFactory.getLogger(CompraService.class);
    private final CompraRepository compraRepository;
    private final UsuarioRepository usuarioRepository;
    private final VideojuegoRepository videojuegoRepository;

    public CompraService(CompraRepository compraRepository, UsuarioRepository usuarioRepository,
                         VideojuegoRepository videojuegoRepository) {
        this.compraRepository = compraRepository;
        this.usuarioRepository = usuarioRepository;
        this.videojuegoRepository = videojuegoRepository;
    }

    @Transactional
    public CompraResponseDTO registrar(String username, CompraRequestDTO request) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));

        BigDecimal total = BigDecimal.ZERO;
        List<DetalleBoleta> detalles = new ArrayList<>();
        for (CompraRequestDTO.Item item : request.getItems()) {
            Videojuego videojuego = videojuegoRepository.findById(item.getVideojuegoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Videojuego no encontrado con id " + item.getVideojuegoId()));
            BigDecimal precioBase = videojuego.getPrecio() == null ? BigDecimal.ZERO : videojuego.getPrecio();
            boolean enOferta = Boolean.TRUE.equals(videojuego.getEnOferta()) && videojuego.getPrecioOferta() != null;
            BigDecimal precio = enOferta ? videojuego.getPrecioOferta() : precioBase;
            BigDecimal subtotal = precio.multiply(BigDecimal.valueOf(item.getCantidad()));
            total = total.add(subtotal);

            DetalleBoleta detalle = new DetalleBoleta();
            detalle.setProducto(videojuego);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precio);
            detalles.add(detalle);
        }

        Compra compra = new Compra();
        compra.setUsuario(usuario);
        compra.setNombre(request.getNombre().trim());
        compra.setEmail(request.getEmail().trim().toLowerCase());
        compra.setDireccion(request.getDireccion().trim());
        compra.setEntrega(request.getEntrega().trim());
        compra.setTotal(total);
        detalles.forEach(detalle -> detalle.setBoleta(compra));
        compra.setDetalles(detalles);

        Compra guardada = compraRepository.save(compra);
        log.info("Boleta simulada registrada id={} usuario={} total={} estado={}",
                guardada.getId(), username, total, guardada.getEstado());
        return toResponse(guardada);
    }

    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listarPropias(String username) {
        return compraRepository.findByUsuarioUsernameOrderByFechaCreacionDesc(username)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listarTodas() {
        return compraRepository.findAllByOrderByFechaCreacionDesc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CompraResponseDTO obtenerPorId(Long id) {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Boleta no encontrada con id " + id));
        return toResponse(compra);
    }

    private CompraResponseDTO toResponse(Compra compra) {
        List<DetalleBoletaResponseDTO> items = compra.getDetalles().stream().map(detalle -> {
            BigDecimal subtotal = detalle.getPrecioUnitario().multiply(BigDecimal.valueOf(detalle.getCantidad()));
            return new DetalleBoletaResponseDTO(
                    detalle.getId(), detalle.getProducto().getId(), detalle.getProducto().getTitulo(),
                    detalle.getCantidad(), detalle.getPrecioUnitario(), subtotal);
        }).toList();
        return new CompraResponseDTO(compra.getId(), compra.getNombre(), compra.getEmail(), compra.getDireccion(),
                compra.getEntrega(), compra.getTotal(), compra.getEstado(), compra.getFechaCreacion(), items);
    }
}
