package com.finca.models;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public class GoogleCalendarService {

    public void crearEvento(String nombreUsuario, String fechaInicio, String fechaFin) throws Exception {
        // 1. Usamos una variable temporal para determinar de dónde vienen los datos
        InputStream streamTemporal = null;

        // Intentar leer desde las Variables de Entorno (Esto funcionará en RENDER)
        String credencialesEnv = System.getenv("GOOGLE_CREDENTIALS");
        
        if (credencialesEnv != null && !credencialesEnv.trim().isEmpty()) {
            streamTemporal = new ByteArrayInputStream(credencialesEnv.getBytes(StandardCharsets.UTF_8));
            System.out.println("Conectando a Google Calendar vía Render (Variables de Entorno)");
        } else {
            // Intentar leer desde el archivo físico (Esto funcionará en TU PC)
            String nombreArchivo = "credentials.json";
            try {
                streamTemporal = new FileInputStream(nombreArchivo);
                System.out.println("Conectando a Google Calendar vía PC local");
            } catch (Exception e) {
                streamTemporal = getClass().getClassLoader().getResourceAsStream(nombreArchivo);
            }
        }

        if (streamTemporal == null) {
            throw new java.io.FileNotFoundException("Error crítico: No hay credenciales en Render ni en la PC local.");
        }

        // 2. Pasamos el temporal a la variable definitiva del try (Esto soluciona el error rojo)
        try (InputStream is = streamTemporal) {
            GoogleCredential credential = GoogleCredential.fromStream(is)
                    .createScoped(Collections.singletonList("https://www.googleapis.com/auth/calendar"));

            Calendar service = new Calendar.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    credential)
                    .setApplicationName("Kazawencas")
                    .build();

            Event evento = new Event()
                    .setSummary("Reserva: " + nombreUsuario)
                    .setDescription("Reserva confirmada en Finca Kazawenca's");

            EventDateTime inicio = new EventDateTime().setDate(new DateTime(fechaInicio));
            evento.setStart(inicio);

            EventDateTime fin = new EventDateTime().setDate(new DateTime(fechaFin));
            evento.setEnd(fin);

            service.events().insert("primary", evento).execute();
            System.out.println("¡Éxito! Evento creado en el calendario para: " + nombreUsuario);
        }
    }
}