package com.finca.models;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;

import java.io.FileInputStream;
import java.util.Collections;

public class GoogleCalendarService {

    public void crearEvento(String nombreUsuario, String fechaInicio, String fechaFin) throws Exception {

        // 1. Cargar las credenciales de la cuenta de servicio
        //    El archivo 'credentials.json' debe estar en la carpeta raíz 'finca-backend'
        GoogleCredential credential = GoogleCredential
                .fromStream(new FileInputStream("credentials.json"))
                .createScoped(Collections.singletonList("https://www.googleapis.com/auth/calendar"));

        // 2. Construir el cliente del servicio de Google Calendar
        Calendar service = new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential)
                .setApplicationName("Kazawencas")
                .build();

        // 3. Crear el objeto del evento con nombre y descripción
        Event evento = new Event()
                .setSummary("Reserva: " + nombreUsuario)
                .setDescription("Nueva reserva confirmada en KAZAWENCA'S.");

        // 4. Configurar las fechas de inicio y fin
        //    Formato esperado desde la BD/frontend: AAAA-MM-DD
        EventDateTime inicio = new EventDateTime().setDate(new DateTime(fechaInicio));
        evento.setStart(inicio);

        EventDateTime fin = new EventDateTime().setDate(new DateTime(fechaFin));
        evento.setEnd(fin);

        // 5. Insertar el evento en el calendario principal de la cuenta
        service.events().insert("primary", evento).execute();

        System.out.println("Evento creado con éxito para: " + nombreUsuario);
    }
}