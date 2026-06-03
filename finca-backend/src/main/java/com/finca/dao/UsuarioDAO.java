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
        // Consulta directa sin TRIM para evitar errores de sintaxis si la columna es sensible
        String sql = "SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE correo = ? AND password_hash = ?";

        System.out.println("DEBUG DAO: Buscando usuario con correo: [" + correo + "] y pass: [" + password + "]");

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, correo.trim());
            ps.setString(2, password.trim());

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                System.out.println("DEBUG DAO: ¡Usuario encontrado en Supabase!");
                usuario = new Usuario();
                usuario.setIdUsuario(rs.getInt("id_usuario"));
                usuario.setNombre(rs.getString("nombre"));
                usuario.setCorreo(rs.getString("correo"));
                usuario.setRol(rs.getString("rol"));
            } else {
                System.out.println("DEBUG DAO: Ningún registro coincide en la BD.");
            }
        } catch (SQLException e) {
            System.out.println("ERROR SQL: " + e.getMessage());
        }
        return usuario;
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
}