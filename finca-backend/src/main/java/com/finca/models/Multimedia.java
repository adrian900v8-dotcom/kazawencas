package com.finca.models;

public class Multimedia {
    private int idArchivo;
    private String urlArchivo;
    private String tipo;
    private String descripcion;
    private String fechaSubida;

    public Multimedia() {}

    public int getIdArchivo() { return idArchivo; }
    public void setIdArchivo(int idArchivo) { this.idArchivo = idArchivo; }

    public String getUrlArchivo() { return urlArchivo; }
    public void setUrlArchivo(String urlArchivo) { this.urlArchivo = urlArchivo; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(String fechaSubida) { this.fechaSubida = fechaSubida; }
}
