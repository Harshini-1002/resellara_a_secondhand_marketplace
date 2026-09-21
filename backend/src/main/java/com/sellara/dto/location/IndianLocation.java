package com.sellara.dto.location;

public class IndianLocation {
    private String city;
    private String district;
    private String state;
    private String pinCode;
    private String formatted;

    public IndianLocation() {}

    public IndianLocation(String city, String district, String state, String pinCode) {
        this.city = city;
        this.district = district;
        this.state = state;
        this.pinCode = pinCode;
        this.formatted = String.format("%s, %s, %s", city, district, state);
    }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }

    public String getFormatted() { return formatted; }
    public void setFormatted(String formatted) { this.formatted = formatted; }
}