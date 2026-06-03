package com.finca.models;

public class Usuario {
    private int idUsuario;
    private String nombre;
    private String correo;
    private String rol;
    private String passwordHash; // ¡Esta era la pieza que faltaba!

    public Usuario() {}

    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}