package com.finca.models;

public class Tarifa {
    private int idTarifa;
    private String tipoTemporada;
    private double precioPorNoche;

    public Tarifa() {}

    public int getIdTarifa() { return idTarifa; }
    public void setIdTarifa(int idTarifa) { this.idTarifa = idTarifa; }

    public String getTipoTemporada() { return tipoTemporada; }
    public void setTipoTemporada(String tipoTemporada) { this.tipoTemporada = tipoTemporada; }

    public double getPrecioPorNoche() { return precioPorNoche; }
    public void setPrecioPorNoche(double precioPorNoche) { this.precioPorNoche = precioPorNoche; }
}