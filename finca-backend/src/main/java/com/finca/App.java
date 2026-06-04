package com.finca;

import com.finca.config.JwtUtil;
import java.util.Map;
import io.javalin.Javalin;
import com.auth0.jwt.interfaces.DecodedJWT;
import io.javalin.http.UnauthorizedResponse;
import com.finca.dao.UsuarioDAO;
import com.finca.dao.ResenaDAO;
import com.finca.dao.ReservaDAO;
import com.finca.models.Reserva;
import com.finca.dao.TarifaDAO;
import com.finca.dao.MultimediaDAO;

public class App {

    public static void main(String[] args) {

        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    // 1. Permitimos tu entorno local (Live Server en tu PC)
                    it.allowHost("http://localhost:5500", "http://127.0.0.1:5500");
                    
                    // 2. Permitimos tu futura página en Netlify
                    // (Cambiarás esto por el link exacto que te dé Netlify más adelante)
                    it.allowHost("https://kazawencas.netlify.app");
                    it.allowCredentials = true;
                });
            });
        }).start(7070);

        System.out.println("==========================================");
        System.out.println("API de la Finca encendida en http://localhost:7070");
        System.out.println("==========================================");

        // ==========================================
        // MIDDLEWARE — Filtro de seguridad
        // ==========================================
        app.before(ctx -> {
            String ruta   = ctx.path();
            String metodo = ctx.method().name();

            if (metodo.equals("OPTIONS")) {
                return;
            }

            boolean esLogin    = ruta.equals("/api/login");
            boolean esRegistro = ruta.equals("/api/registro");

            // Rutas públicas de solo lectura
            boolean esLecturaPublica = (
                ruta.equals("/api/tarifas")             ||
                ruta.equals("/api/multimedia")          ||
                ruta.equals("/api/resenas")             ||
                ruta.equals("/api/reservas")            || // ← GET público para admin panel
                ruta.equals("/api/reservas/ocupadas")      // ← GET público para calendario
            ) && metodo.equals("GET");

            if (!esLogin && !esRegistro && !esLecturaPublica) {
                String header = ctx.header("Authorization");

                if (header == null || !header.startsWith("Bearer ")) {
                    throw new UnauthorizedResponse("Acceso denegado. Faltan credenciales.");
                }

                String token = header.replace("Bearer ", "");
                DecodedJWT jwt = JwtUtil.verificarToken(token);

                if (jwt == null) {
                    throw new UnauthorizedResponse("Acceso denegado. Token inválido.");
                }

                ctx.attribute("rolUsuario", jwt.getClaim("rol").asString());
            }
        });

        // ==========================================
        // ENDPOINTS
        // ==========================================

        // --- Login ---
        app.post("/api/login", ctx -> {
            com.finca.models.Usuario credenciales = ctx.bodyAsClass(com.finca.models.Usuario.class);
            
            // LOG DE DIAGNÓSTICO
            System.out.println("DEBUG APP: JSON recibido -> Correo: [" + credenciales.getCorreo() + 
                               "], PasswordHash: [" + credenciales.getPasswordHash() + "]");

            UsuarioDAO dao = new UsuarioDAO();
            com.finca.models.Usuario usuarioLogueado = dao.login(
                credenciales.getCorreo(),
                credenciales.getPasswordHash()
            );

            if (usuarioLogueado != null) {
                String token = JwtUtil.generarToken(usuarioLogueado);
                ctx.status(200).json(Map.of(
                    "mensaje",    "Login exitoso",
                    "token",      token,
                    "rol",        usuarioLogueado.getRol(),
                    "id_usuario", usuarioLogueado.getIdUsuario(),
                    "nombre",     usuarioLogueado.getNombre()
                ));
            } else {
                ctx.status(401).result("Credenciales incorrectas");
            }
        });

        // --- Reservas ---
        app.get("/api/reservas", ctx -> {
            ctx.json(new ReservaDAO().obtenerTodas());
        });

        app.get("/api/reservas/ocupadas", ctx -> {
            ctx.json(new ReservaDAO().obtenerFechasOcupadas());
        });

        app.post("/api/reservas", ctx -> {
            Reserva reserva = ctx.bodyAsClass(Reserva.class);

            if (reserva.getEstado() == null || reserva.getEstado().isEmpty()) {
                reserva.setEstado("confirmada");
            }

            ReservaDAO dao = new ReservaDAO();

            if (dao.fechasOcupadas(reserva.getFechaInicio(), reserva.getFechaFin())) {
                ctx.status(409).json(Map.of("message", "Las fechas seleccionadas no estan disponibles."));
                return;
            }

            dao.insertar(reserva);
            ctx.status(201).json(Map.of("message", "Reserva creada correctamente"));
        });

        app.put("/api/reservas/{id}", ctx -> {
            // Candado de seguridad para editar
            String rol = ctx.attribute("rolUsuario");
            if (rol == null || !rol.equalsIgnoreCase("admin")) {
                ctx.status(403).json(Map.of("message", "Acceso denegado. Solo administradores pueden editar reservas."));
                return;
            }

            int id = Integer.parseInt(ctx.pathParam("id"));
            Reserva reserva = ctx.bodyAsClass(Reserva.class);
            reserva.setIdReserva(id);
            new ReservaDAO().actualizar(reserva);
            ctx.result("Reserva actualizada");
        });

        app.delete("/api/reservas/{id}", ctx -> {
            // Candado de seguridad para eliminar
            String rol = ctx.attribute("rolUsuario");
            
            if (rol == null || !rol.equalsIgnoreCase("admin")) {
                ctx.status(403).json(Map.of("message", "Acceso denegado. Solo administradores pueden eliminar reservas."));
                return;
            }

            try {
                int id = Integer.parseInt(ctx.pathParam("id"));
                new ReservaDAO().eliminar(id);
                ctx.status(200).json(Map.of("message", "Reserva eliminada con exito"));
            } catch (Exception e) {
                ctx.status(500).json(Map.of("message", "Error al procesar la eliminacion"));
            }
        });

        // --- Reseñas ---
        app.get("/api/resenas", ctx -> {
            ctx.json(new ResenaDAO().obtenerTodas());
        });

        app.post("/api/resenas", ctx -> {
            try {
                com.finca.models.Resena nuevaResena = ctx.bodyAsClass(com.finca.models.Resena.class);
                new ResenaDAO().insertar(nuevaResena);
                ctx.status(201).json(Map.of("mensaje", "Resena publicada con exito"));
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).json(Map.of("mensaje", "Error al guardar en la base de datos"));
            }
        });

        app.delete("/api/resenas/{id}", ctx -> {
            String rol = ctx.attribute("rolUsuario");

            if (rol == null || !rol.equalsIgnoreCase("admin")) {
                ctx.status(403).json(Map.of("mensaje", "Acceso denegado. Solo administradores pueden eliminar."));
                return;
            }

            try {
                int id = Integer.parseInt(ctx.pathParam("id"));
                new ResenaDAO().eliminar(id);
                ctx.status(200).json(Map.of("mensaje", "Resena eliminada con exito"));
            } catch (Exception e) {
                ctx.status(500).json(Map.of("mensaje", "Error al procesar la eliminacion"));
            }
        });

        // --- Registro ---
        app.post("/api/registro", ctx -> {
            new UsuarioDAO().registrar(ctx.bodyAsClass(com.finca.models.Usuario.class));
            ctx.status(201).result("Usuario registrado");
        });

        // --- Tarifas ---
        app.get("/api/tarifas", ctx -> {
            ctx.json(new TarifaDAO().obtenerTodas());
        });

        // --- Multimedia ---
        app.get("/api/multimedia", ctx -> {
            ctx.json(new MultimediaDAO().obtenerTodos());
        });

        app.post("/api/multimedia", ctx -> {
            new MultimediaDAO().insertar(ctx.bodyAsClass(com.finca.models.Multimedia.class));
            ctx.status(201).result("Multimedia registrada");
        });
    }
}