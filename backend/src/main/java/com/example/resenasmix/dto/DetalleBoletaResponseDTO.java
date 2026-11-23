package com.example.resenasmix.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DetalleBoletaResponseDTO {
    private Long id;
    private Long videojuegoId;
    private String titulo;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}
