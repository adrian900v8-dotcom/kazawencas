package com.finca.models;

public class Resena {
    private int idResena;
    private int idUsuario;
    private String comentario;
    private int calificacion;
    private String fechaPublicacion;
    private String nombre; // Esta variable ya estaba, solo faltaban sus métodos

    public Resena() {}

    public int getIdResena() { return idResena; }
    public void setIdResena(int idResena) { this.idResena = idResena; }

    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public int getCalificacion() { return calificacion; }
    public void setCalificacion(int calificacion) { this.calificacion = calificacion; }

    public String getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(String fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }

    // --- MÉTODOS AGREGADOS ---
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}