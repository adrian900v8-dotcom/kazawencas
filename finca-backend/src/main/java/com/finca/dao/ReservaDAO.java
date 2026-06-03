package com.finca.dao;

import com.finca.config.ConexionBD;
import com.finca.models.Reserva;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ReservaDAO {

    public List<Reserva> obtenerTodas() {
        List<Reserva> lista = new ArrayList<>();
        String sql = "SELECT r.*, u.nombre, t.tipo_temporada FROM reservas r " +
                     "INNER JOIN usuarios u ON r.id_usuario = u.id_usuario " +
                     "INNER JOIN tarifas t ON r.id_tarifa = t.id_tarifa " +
                     "ORDER BY r.id_reserva DESC";
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Reserva r = new Reserva();
                r.setIdReserva(rs.getInt("id_reserva"));
                r.setIdUsuario(rs.getInt("id_usuario"));
                r.setNombreUsuario(rs.getString("nombre"));
                r.setFechaInicio(rs.getString("fecha_inicio"));
                r.setFechaFin(rs.getString("fecha_fin"));
                r.setPrecioTotal(rs.getDouble("precio_total"));
                r.setEstado(rs.getString("estado"));
                r.setNotasAdmin(rs.getString("tipo_temporada"));
                r.setIdTarifa(rs.getInt("id_tarifa"));
                lista.add(r);
            }
        } catch (SQLException e) {
            System.out.println("Error en ReservaDAO: " + e.getMessage());
        }
        return lista;
    }

    public List<String> obtenerFechasOcupadas() {
        List<String> fechas = new ArrayList<>();
        String sql = "SELECT generate_series(fecha_inicio::date, fecha_fin::date - 1, '1 day'::interval)::date AS fecha_ocupada " +
                     "FROM reservas WHERE estado != 'cancelada' ORDER BY fecha_ocupada";
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                fechas.add(rs.getString("fecha_ocupada"));
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener fechas ocupadas: " + e.getMessage());
        }
        return fechas;
    }

    public boolean fechasOcupadas(String fechaInicio, String fechaFin) {
        String sql = "SELECT COUNT(*) FROM reservas " +
                     "WHERE estado != 'cancelada' " +
                     "AND fecha_inicio::date < ?::date " +
                     "AND fecha_fin::date > ?::date";
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, fechaFin);
            ps.setString(2, fechaInicio);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            System.out.println("Error al verificar fechas: " + e.getMessage());
        }
        return false;
    }

    public void insertar(Reserva r) {
        String sql = "INSERT INTO reservas (id_usuario, fecha_inicio, fecha_fin, precio_total, estado, notas_admin, id_tarifa) " +
                     "VALUES (?, ?::date, ?::date, ?, ?, ?, ?)";
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, r.getIdUsuario());
            ps.setString(2, r.getFechaInicio());
            ps.setString(3, r.getFechaFin());
            ps.setDouble(4, r.getPrecioTotal());
            ps.setString(5, r.getEstado());
            ps.setString(6, r.getNotasAdmin());
            ps.setInt(7, r.getIdTarifa());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error al insertar reserva: " + e.getMessage());
        }
    }

    public void actualizar(Reserva r) {
        String sql = "UPDATE reservas SET id_usuario = ?, fecha_inicio = ?::date, fecha_fin = ?::date, " +
                     "precio_total = ?, estado = ?, notas_admin = ?, id_tarifa = ? WHERE id_reserva = ?";
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, r.getIdUsuario());
            ps.setString(2, r.getFechaInicio());
            ps.setString(3, r.getFechaFin());
            ps.setDouble(4, r.getPrecioTotal());
            ps.setString(5, r.getEstado());
            ps.setString(6, r.getNotasAdmin());
            ps.setInt(7, r.getIdTarifa());
            ps.setInt(8, r.getIdReserva());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error al actualizar reserva: " + e.getMessage());
        }
    }

    public void eliminar(int idReserva) {
        String sql = "DELETE FROM reservas WHERE id_reserva = ?";
        try (Connection con = ConexionBD.obtenerConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idReserva);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error al eliminar reserva: " + e.getMessage());
        }
    }
}
