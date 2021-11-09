import * as satellite from 'satellite.js';

/**
 * Converts a given date into a certain format
 * @param type the date format to convert into, currently supports julian, j2000, gmst
 * @param date a date object, default is the current time and date
 * @returns the formatted date
 */
function convertDate(type,date = new Date()){
    var julian_date = (date / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;

    switch(type){
        case 'julian':
            return julian_date
        case 'j2000':
            return julian_date - 2451545.0
        case 'gmst':
            return satellite.gstime(date);
        default:
            return date
    }    
}

/**
 * Calculates the Earth axial tilt/obliquity for a given date
 * @param j2000 a j2000 date, default is the current date
 * @returns the axial tilt of the earth in radians
 */
function calculateEarthTilt(j2000 = convertDate('j2000')){
    return (23.439-0.0000004*j2000)*Math.PI/180;
}

/**
 * Calculates the right acension and declination of the Sun (Celestial Equatorial)
 * @param j2000 a j2000 date, default is the current date
 * @returns an array containing the right acension and declination of the Sun in radians
 */
function calculateSunPositionCE(j2000 = convertDate('j2000')){
    var L = 280.460 + 0.9856474*j2000;
    var g = 357.528 + 0.9856003*j2000;
    var epsilon = calculateEarthTilt(j2000);

    g = (g % 360)*Math.PI/180;

    var lambda = L + 1.915*Math.sin(g) + 0.020*Math.sin(2*g);
    lambda = lambda*Math.PI/180;

    var ra = Math.atan2(Math.cos(epsilon)*Math.sin(lambda), Math.cos(lambda));
    var dec = Math.asin(Math.sin(epsilon)*Math.sin(lambda));

    return [ra, dec]; 
}

/**
 * Calculates the x,y,z coordinates of the Sun (ECI)
 * @param j2000 a j2000 date, default is the current date
 * @returns an array containing the x,y,z coordinates of the sun
 */
function calculateSunPositionECI(j2000 = convertDate('j2000')){
    var [ra, dec] = calculateSunPositionCE(j2000);

    var x = Math.cos(dec)*Math.cos(ra);
    var y = Math.cos(dec)*Math.sin(ra);
    var z = Math.sin(dec);

    return [x,y,z]
}

/**
 * Calculates a rotation of the Earth about its axis to match the Greenwich meridian to the vernal equinox
 * @param gmst a gmst date, default is the current date
 * @returns the rotation of the earth about its axis in radians
 */
function calculateEarthRotation(gmst = convertDate('gmst')){
    return -gmst-Math.PI/2;
}

export {
    convertDate,
    calculateEarthTilt,
    calculateEarthRotation,
    calculateSunPositionCE,
    calculateSunPositionECI,
}