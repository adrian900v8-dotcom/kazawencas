package com.finca.models;

public class Reserva {
    private int idReserva;
    private int idUsuario;
    private String fechaInicio;
    private String fechaFin;
    private double precioTotal;
    private String estado;
    private String notasAdmin;
    private String nombreUsuario;
    private int idTarifa; // Nuevo campo

    public Reserva() {}

    // Getters y Setters existentes
    public int getIdReserva() { return idReserva; }
    public void setIdReserva(int idReserva) { this.idReserva = idReserva; }
    
    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
    
    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }
    
    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }
    
    public double getPrecioTotal() { return precioTotal; }
    public void setPrecioTotal(double precioTotal) { this.precioTotal = precioTotal; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public String getNotasAdmin() { return notasAdmin; }
    public void setNotasAdmin(String notasAdmin) { this.notasAdmin = notasAdmin; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    // NUEVOS MÉTODOS PARA TARIFA
    public int getIdTarifa() { return idTarifa; }
    public void setIdTarifa(int idTarifa) { this.idTarifa = idTarifa; }
}
