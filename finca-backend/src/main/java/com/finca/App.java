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
                    it.allowHost("https://radiant-duckanoo-97112e.netlify.app", "http://localhost:5500");
                    it.allowCredentials = true;
                });
            });
        }).start(7070);

        System.out.println("==========================================");
        System.out.println("API encendida en puerto 7070");
        System.out.println("==========================================");

        app.before(ctx -> {
            if (ctx.method().name().equals("OPTIONS")) return;

            String ruta = ctx.path();
            boolean esLogin = ruta.equals("/api/login");
            boolean esRegistro = ruta.equals("/api/registro");
            boolean esLecturaPublica = (
                ruta.equals("/api/tarifas") || ruta.equals("/api/multimedia") ||
                ruta.equals("/api/resenas") || ruta.equals("/api/reservas") ||
                ruta.equals("/api/reservas/ocupadas")
            ) && ctx.method().name().equals("GET");

            if (!esLogin && !esRegistro && !esLecturaPublica) {
                String header = ctx.header("Authorization");
                if (header == null || !header.startsWith("Bearer ")) {
                    throw new UnauthorizedResponse("Acceso denegado.");
                }
                String token = header.replace("Bearer ", "");
                DecodedJWT jwt = JwtUtil.verificarToken(token);
                if (jwt == null) throw new UnauthorizedResponse("Token inválido.");
                ctx.attribute("rolUsuario", jwt.getClaim("rol").asString());
            }
        });

        app.post("/api/login", ctx -> {
            com.finca.models.Usuario credenciales = ctx.bodyAsClass(com.finca.models.Usuario.class);
            UsuarioDAO dao = new UsuarioDAO();
            com.finca.models.Usuario usuarioLogueado = dao.login(credenciales.getCorreo(), credenciales.getPasswordHash());

            if (usuarioLogueado != null) {
                String token = JwtUtil.generarToken(usuarioLogueado);
                ctx.status(200).json(Map.of("mensaje", "Login exitoso", "token", token, "rol", usuarioLogueado.getRol(), "id_usuario", usuarioLogueado.getIdUsuario(), "nombre", usuarioLogueado.getNombre()));
            } else {
                ctx.status(401).result("Credenciales incorrectas");
            }
        });

        // Endpoints restantes
        app.get("/api/reservas", ctx -> ctx.json(new ReservaDAO().obtenerTodas()));
        app.post("/api/reservas", ctx -> {
            Reserva r = ctx.bodyAsClass(Reserva.class);
            if (r.getEstado() == null || r.getEstado().isEmpty()) r.setEstado("confirmada");
            new ReservaDAO().insertar(r);
            ctx.status(201).json(Map.of("message", "Reserva creada"));
        });
        app.post("/api/registro", ctx -> {
            new UsuarioDAO().registrar(ctx.bodyAsClass(com.finca.models.Usuario.class));
            ctx.status(201).result("Usuario registrado");
        });
    }
}