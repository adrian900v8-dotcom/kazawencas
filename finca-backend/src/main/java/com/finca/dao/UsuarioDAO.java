package com.finca.dao;

import com.finca.config.ConexionBD;
import com.finca.models.Usuario;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UsuarioDAO {

    public Usuario login(String correo, String password) {
    Usuario usuario = null;
    // Agregamos un trim() por si hay espacios invisibles
    String sql = "SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE TRIM(correo) = TRIM(?) AND TRIM(password_hash) = TRIM(?)";

    System.out.println("DEBUG: Iniciando intento de login para: [" + correo + "]");

    try (Connection con = ConexionBD.obtenerConexion();
         PreparedStatement ps = con.prepareStatement(sql)) {
        
        ps.setString(1, correo);
        ps.setString(2, password);

        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            System.out.println("DEBUG: ¡Usuario encontrado en Supabase!");
            usuario = new Usuario();
            usuario.setIdUsuario(rs.getInt("id_usuario"));
            usuario.setNombre(rs.getString("nombre"));
            usuario.setCorreo(rs.getString("correo"));
            usuario.setRol(rs.getString("rol"));
        } else {
            System.out.println("DEBUG: Ningún registro coincide en la BD para ese correo y password.");
        }
    } catch (SQLException e) {
        System.out.println("ERROR SQL: " + e.getMessage());
    }
    return usuario;
}
    // --- PRUEBA DEL LOGIN ---
    public static void main(String[] args) {
        UsuarioDAO dao = new UsuarioDAO();
        System.out.println("Buscando en Supabase...");
        
        // Usamos los datos de la tabla que me mostraste
        Usuario admin = dao.login("wivava24@finca.com", "Valeriavalencia123@");

        if (admin != null) {
            System.out.println("¡Login exitoso!");
            System.out.println("Bienvenido: " + admin.getNombre() + " | Rol: " + admin.getRol());
        } else {
            System.out.println("Login fallido: Correo o contraseña incorrectos.");
        }
    }

    public void registrar(Usuario u) {
        // Forzamos el rol a 'cliente' por seguridad y usamos CURRENT_TIMESTAMP para la fecha
        String sql = "INSERT INTO usuarios (nombre, correo, password_hash, rol, fecha_registro) VALUES (?, ?, ?, 'cliente', CURRENT_TIMESTAMP)";
        
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, u.getNombre());
            ps.setString(2, u.getCorreo());
            ps.setString(3, u.getPasswordHash()); 
            
            ps.executeUpdate();
            System.out.println("Nuevo usuario (cliente) registrado correctamente en la BD.");
            
        } catch (SQLException e) {
            System.out.println("Error al registrar usuario: " + e.getMessage());
        }
    }
}