package com.finca.dao;

import com.finca.config.ConexionBD;
import com.finca.models.Tarifa;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class TarifaDAO {

    // Método para LEER todas las tarifas
    public List<Tarifa> obtenerTodas() {
        List<Tarifa> lista = new ArrayList<>();
        String sql = "SELECT id_tarifa, tipo_temporada, precio_por_noche FROM tarifas";

        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Tarifa t = new Tarifa();
                t.setIdTarifa(rs.getInt("id_tarifa"));
                t.setTipoTemporada(rs.getString("tipo_temporada"));
                t.setPrecioPorNoche(rs.getDouble("precio_por_noche"));
                lista.add(t);
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener tarifas: " + e.getMessage());
        }
        return lista;
    }

    // Método para INSERTAR una nueva tarifa
    public void insertar(Tarifa t) {
        String sql = "INSERT INTO tarifas (tipo_temporada, precio_por_noche) VALUES (?, ?)";
        
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, t.getTipoTemporada());
            ps.setDouble(2, t.getPrecioPorNoche());
            
            ps.executeUpdate();
            System.out.println("Tarifa insertada correctamente en la BD.");
            
        } catch (SQLException e) {
            System.out.println("Error al insertar tarifa: " + e.getMessage());
        }
    }
}