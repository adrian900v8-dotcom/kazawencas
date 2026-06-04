package com.finca.dao;

import com.finca.config.ConexionBD;
import com.finca.models.Usuario;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UsuarioDAO {

    public Usuario login(String correo, String password) throws Exception {
        Usuario usuario = null;
        // Ahora buscamos solo por el correo para poder revisar qué tipo de cuenta es
        String sql = "SELECT * FROM usuarios WHERE correo = ?";
        
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
             
            ps.setString(1, correo.trim());
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                String hashBD = rs.getString("password_hash");
                
                // 1. Validar si la cuenta está amarrada a Google
                if ("LOGIN_GOOGLE".equals(hashBD)) {
                    throw new Exception("CUENTA_GOOGLE"); // Lanzamos la alerta
                }
                
                // 2. Si es una cuenta normal, comprobamos la contraseña manual
                if (hashBD.equals(password.trim())) {
                    usuario = new Usuario();
                    usuario.setIdUsuario(rs.getInt("id_usuario"));
                    usuario.setNombre(rs.getString("nombre"));
                    usuario.setCorreo(rs.getString("correo"));
                    usuario.setRol(rs.getString("rol"));
                }
            }
        } catch (SQLException e) {
            System.out.println("ERROR SQL Login: " + e.getMessage());
        }
        return usuario; // Retorna null si la contraseña manual es incorrecta
    }

    public void registrar(Usuario u) {
        String sql = "INSERT INTO usuarios (nombre, correo, password_hash, rol, fecha_registro) VALUES (?, ?, ?, 'cliente', CURRENT_TIMESTAMP)";
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, u.getNombre());
            ps.setString(2, u.getCorreo());
            ps.setString(3, u.getPasswordHash()); 
            ps.executeUpdate();
            System.out.println("DEBUG DAO: Usuario registrado correctamente.");
        } catch (SQLException e) {
            System.out.println("ERROR SQL Registro: " + e.getMessage());
        }
    }

    // Método para buscar si el correo de Google ya existe en nuestra base de datos
    public Usuario buscarPorCorreo(String correo) {
        Usuario usuario = null;
        String sql = "SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE correo = ?";
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, correo.trim());
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                usuario = new Usuario();
                usuario.setIdUsuario(rs.getInt("id_usuario"));
                usuario.setNombre(rs.getString("nombre"));
                usuario.setCorreo(rs.getString("correo"));
                usuario.setRol(rs.getString("rol"));
            }
        } catch (SQLException e) {
            System.out.println("ERROR SQL Buscar Correo: " + e.getMessage());
        }
        return usuario;
    }

    // Método para registrar a alguien que entró por Google (sin contraseña)
    public void registrarGoogle(Usuario u) {
        String sql = "INSERT INTO usuarios (nombre, correo, password_hash, rol, fecha_registro) VALUES (?, ?, 'LOGIN_GOOGLE', 'cliente', CURRENT_TIMESTAMP)";
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, u.getNombre());
            ps.setString(2, u.getCorreo());
            ps.executeUpdate();
            System.out.println("Usuario de Google registrado correctamente.");
        } catch (SQLException e) {
            System.out.println("ERROR SQL Registro Google: " + e.getMessage());
        }
    }
}