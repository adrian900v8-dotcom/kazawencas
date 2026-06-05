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
        // 1. Cargar tus credenciales (asegúrate de que el archivo esté en la raíz del proyecto)
        GoogleCredential credential = GoogleCredential.fromStream(new FileInputStream("credentials.json"))
            .createScoped(Collections.singletonList("https://www.googleapis.com/auth/calendar"));

        // 2. Construir el servicio de Google Calendar
        Calendar service = new Calendar.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            GsonFactory.getDefaultInstance(),
            credential).setApplicationName("Kazawencas").build();

        // 3. Crear el objeto del evento
        Event evento = new Event()
            .setSummary("Reserva: " + nombreUsuario)
            .setDescription("Nueva reserva confirmada en KAZAWENCA'S.");

        // 4. Configurar fechas (Formato esperado: AAAA-MM-DD)
        EventDateTime inicio = new EventDateTime().setDate(new DateTime(fechaInicio));
        evento.setStart(inicio);

        EventDateTime fin = new EventDateTime().setDate(new DateTime(fechaFin));
        evento.setEnd(fin);

        // 5. Insertar en el calendario "primary" (Tu calendario principal)
        service.events().insert("primary", evento).execute();
        
        System.out.println("Evento creado con éxito para: " + nombreUsuario);
    }
}