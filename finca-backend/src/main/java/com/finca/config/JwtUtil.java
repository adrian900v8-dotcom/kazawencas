package com.finca.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.finca.models.Usuario;
import java.util.Date;

public class JwtUtil {
    // La firma secreta del servidor. ¡Debe ser la misma siempre!
    private static final String SECRET_KEY = "MiClaveSuperSecretaParaLaFinca123!";
    private static final Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);

    // Método 1: FABRICAR el Token (El que ya tenías)
    public static String generarToken(Usuario u) {
        try {
            long tiempoExpiracion = System.currentTimeMillis() + 3600000; // 1 hora
            return JWT.create()
                .withIssuer("FincaBackend")
                .withClaim("id_usuario", u.getIdUsuario())
                .withClaim("rol", u.getRol())
                .withExpiresAt(new Date(tiempoExpiracion))
                .sign(algorithm);
        } catch (JWTCreationException exception) {
            System.out.println("Error al crear el token: " + exception.getMessage());
            return null;
        }
    }

    // Método 2: NUEVO - LEER y VERIFICAR el Token
    public static DecodedJWT verificarToken(String token) {
        try {
            JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer("FincaBackend")
                .build();
            return verifier.verify(token); // Si es válido, lo decodifica
        } catch (JWTVerificationException exception) {
            return null; // Si es falso, modificado o expiró, retorna null
        }
    }
}