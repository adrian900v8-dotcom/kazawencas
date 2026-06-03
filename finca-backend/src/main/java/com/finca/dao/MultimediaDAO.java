package com.finca.dao;

import com.finca.config.ConexionBD;
import com.finca.models.Multimedia;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MultimediaDAO {

    // Método para LEER todos los archivos multimedia
    public List<Multimedia> obtenerTodos() {
        List<Multimedia> lista = new ArrayList<>();
        String sql = "SELECT id_archivo, url_archivo, tipo, descripcion, fecha_subida FROM multimedia";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Multimedia m = new Multimedia();
                m.setIdArchivo(rs.getInt("id_archivo"));
                m.setUrlArchivo(rs.getString("url_archivo"));
                m.setTipo(rs.getString("tipo"));
                m.setDescripcion(rs.getString("descripcion"));
                m.setFechaSubida(rs.getString("fecha_subida"));
                lista.add(m);
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener multimedia: " + e.getMessage());
        }
        return lista;
    }

    // Método para INSERTAR un nuevo archivo multimedia
    public void insertar(Multimedia m) {
        String sql = "INSERT INTO multimedia (url_archivo, tipo, descripcion, fecha_subida) VALUES (?, ?, ?, CURRENT_TIMESTAMP)";
        
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, m.getUrlArchivo());
            ps.setString(2, m.getTipo());
            ps.setString(3, m.getDescripcion());
            
            ps.executeUpdate();
            System.out.println("Archivo multimedia insertado correctamente en la BD.");
            
        } catch (SQLException e) {
            System.out.println("Error al insertar multimedia: " + e.getMessage());
        }
    }
}