package com.finca.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionBD {
    
// 1. URL limpia (usando el puerto 6543 del pooler y sin el texto de la contraseña)
    private static final String URL = "jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:6543/postgres?prepareThreshold=0";
    
    // 2. Tu usuario
    private static final String USUARIO = "postgres.jiptevqfshxhqeshvijo";
    
    // 3. La contraseña maestra real
    private static final String PASSWORD = "Valeriavalencia123@";

    public static Connection obtenerConexion() {
        Connection conexion = null;
        try {
            Class.forName("org.postgresql.Driver");
            conexion = DriverManager.getConnection(URL, USUARIO, PASSWORD);
            System.out.println("¡Conexión exitosa a Supabase desde Linux Mint!");
        } catch (ClassNotFoundException e) {
            System.out.println("Error: No se encontró el driver. " + e.getMessage());
        } catch (SQLException e) {
            System.out.println("Error al conectar: " + e.getMessage());
        }
        return conexion;
    }

    public static void main(String[] args) {
        Connection test = obtenerConexion();
        if (test != null) {
            try {
                test.close();
                System.out.println("Conexión de prueba cerrada correctamente.");
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}