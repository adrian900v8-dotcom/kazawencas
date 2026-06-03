package com.finca.dao;

import com.finca.config.ConexionBD;
import com.finca.models.Resena;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ResenaDAO {

    // 1. Método para LEER todas las reseñas con el nombre del usuario (JOIN)
    public List<Resena> obtenerTodas() {
        List<Resena> lista = new ArrayList<>();
        // Unimos las tablas para traer el nombre del usuario
        String sql = "SELECT r.id_resena, r.id_usuario, r.comentario, r.calificacion, r.fecha_publicacion, u.nombre " +
                     "FROM resenas r " +
                     "JOIN usuarios u ON r.id_usuario = u.id_usuario " +
                     "ORDER BY r.fecha_publicacion DESC";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Resena r = new Resena();
                r.setIdResena(rs.getInt("id_resena"));
                r.setIdUsuario(rs.getInt("id_usuario"));
                r.setComentario(rs.getString("comentario"));
                r.setCalificacion(rs.getInt("calificacion"));
                r.setFechaPublicacion(rs.getString("fecha_publicacion"));
                r.setNombre(rs.getString("nombre")); // Mapeamos el nombre que viene del JOIN
                lista.add(r);
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener reseñas: " + e.getMessage());
        }
        return lista;
    }

    // 2. Método para INSERTAR una reseña nueva
    public void insertar(Resena r) {
        String sql = "INSERT INTO resenas (id_usuario, comentario, calificacion, fecha_publicacion) VALUES (?, ?, ?, CURRENT_TIMESTAMP)";
        
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setInt(1, r.getIdUsuario());
            ps.setString(2, r.getComentario());
            ps.setInt(3, r.getCalificacion());
            
            ps.executeUpdate();
            System.out.println("Reseña insertada correctamente en la BD.");
            
        } catch (SQLException e) {
            System.out.println("Error al insertar reseña: " + e.getMessage());
        }
    }

    // 3. Método para ELIMINAR una reseña
    public void eliminar(int idResena) {
        String sql = "DELETE FROM resenas WHERE id_resena = ?";
        
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setInt(1, idResena);
            
            int filasAfectadas = ps.executeUpdate();
            
            if (filasAfectadas > 0) {
                System.out.println("Reseña eliminada correctamente de la BD.");
            } else {
                System.out.println("No se encontró ninguna reseña con ese ID.");
            }
            
        } catch (SQLException e) {
            System.out.println("Error al eliminar reseña: " + e.getMessage());
        }
    }
}