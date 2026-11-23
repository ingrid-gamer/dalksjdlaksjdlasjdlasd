package com.example.resenasmix.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
public class CompraResponseDTO {
    private Long id;
    private String nombre;
    private String email;
    private String direccion;
    private String entrega;
    private BigDecimal total;
    private String estado;
    private Instant fechaCreacion;
    private List<DetalleBoletaResponseDTO> items;
}
