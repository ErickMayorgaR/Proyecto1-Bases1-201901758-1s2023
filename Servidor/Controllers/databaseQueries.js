
const { getConnection } = require('./conexion')
const queries = require('./consultas')

async function consulta(req, res, numC) {
  try {
    const connection = await getConnection();
    let result = null;
    switch (numC) {
      case 1:
        result = await connection.execute(queries.consulta1);
        break;
      case 2:
        result = await connection.execute(queries.consulta2);
        break;
      case 3:
        result = await connection.execute(queries.consulta3);
        break;
      case 4:
        result = await connection.execute(queries.consulta4);
        break;
      case 5:
        result = await connection.execute(queries.consulta5);
        break;
      case 6:
        result = await connection.execute(queries.consulta6);
        break;
      case 7:
        result = await connection.execute(queries.consulta7);
        break;
      case 8:
        result = await connection.execute(queries.consulta8);
        break;
      case 9:
        result = await connection.execute(queries.consulta9);
        break;
      case 10:
        result = await connection.execute(queries.consulta10);
        break;
      default:
        console.log("Caso Indefinido");
    }

    return res.status(200).json({ result });
  } catch (e) {
    return res.status(200).json({ e });
  }
}

async function eliminarTemporal(req, res) {
  try {
    const connection = await getConnection();
    const result = await connection.execute(`DELETE FROM TABLA_TEMPORAL`);
    connection.commit()
    return res.status(200).json({ mensaje: "Tabla Temporal Vaciada" });
  } catch (e) {
    return res.status(200).json({ e });
  }

}

async function eliminarModelo(req, res) {
  try {
    const connection = await getConnection();
    let result = null;
    result = await connection.execute(`DROP TABLE VICTIMAALLEGADOS`);
    result = await connection.execute(`DROP TABLE ALLEGADOS`);
    result = await connection.execute(`DROP TABLE UBICACIONES`);
    result = await connection.execute(`DROP TABLE TRATAMIENTOSVICTIMA`);
    result = await connection.execute(`DROP TABLE TRATAMIENTOS`);
    result = await connection.execute(`DROP TABLE VICTIMAS`);
    result = await connection.execute(`DROP TABLE HOSPITALES`);

    

    return res.status(200).json({ mensaje: "Modelo eliminado exitosamente" });
  } catch (e) {
    return res.status(200).json({ e });
  }
}

async function cargarModelo(req, res) {
  try {

    const connection = await getConnection();
    let result = null;

    result = await connection.execute(`CREATE TABLE hospitales (
      id_hospital        INTEGER GENERATED ALWAYS AS IDENTITY,
      direccion_hospital VARCHAR2(50),
      nombre_hospital    VARCHAR2(50)
  )`);
    result = await connection.execute(`ALTER TABLE hospitales ADD CONSTRAINT hospitales_pk PRIMARY KEY ( id_hospital )`);

    result = await connection.execute(`CREATE TABLE victimas (
      id_victima             INTEGER GENERATED ALWAYS AS IDENTITY,
      nombre_victima         VARCHAR2(50),
      apellido_victima       VARCHAR2(50),
      direccion_victima      VARCHAR2(50),
      fecha_muerte           DATE,
      fecha_primera_sospecha DATE,
      fecha_confirmacion DATE,
      estatus_enfermedad     VARCHAR2(50),
      hospitales_id_hospital INTEGER NOT NULL
  )`);
    result = await connection.execute(`ALTER TABLE victimas ADD CONSTRAINT victimas_pk PRIMARY KEY ( id_victima )`);
    result = await connection.execute(`ALTER TABLE victimas
    ADD CONSTRAINT victimas_hospitales_fk FOREIGN KEY ( hospitales_id_hospital )
        REFERENCES hospitales ( id_hospital )`);

    result = await connection.execute(`CREATE TABLE tratamientos (
      id_tratamiento     INTEGER GENERATED ALWAYS AS IDENTITY,
      nombre_tratamiento VARCHAR2(50),
      efectividad        INTEGER
  )`);
    result = await connection.execute(`ALTER TABLE tratamientos ADD CONSTRAINT tratamientos_pk PRIMARY KEY ( id_tratamiento )`);

    result = await connection.execute(`CREATE TABLE tratamientosvictima (
      id_tratamientos_victima     INTEGER GENERATED ALWAYS AS IDENTITY,
      victimas_id_victima         INTEGER NOT NULL,
      tratamientos_id_tratamiento INTEGER NOT NULL,
      efectividad_en_victima INTEGER,
      fecha_inicio_tratamiento DATE,
      fecha_fin_tratamiento DATE
  )`);
    result = await connection.execute(`ALTER TABLE tratamientosvictima ADD CONSTRAINT tratamientosvictima_pk PRIMARY KEY ( id_tratamientos_victima )`);
    result = await connection.execute(`ALTER TABLE tratamientosvictima
    ADD CONSTRAINT tratvictima_tratamientos_fk FOREIGN KEY ( tratamientos_id_tratamiento )
        REFERENCES tratamientos ( id_tratamiento )`);
    result = await connection.execute(`ALTER TABLE tratamientosvictima
    ADD CONSTRAINT tratvictima_victimas_fk FOREIGN KEY ( victimas_id_victima )
        REFERENCES victimas ( id_victima )`);

    result = await connection.execute(`CREATE TABLE ubicaciones (
    id_ubicacion        INTEGER GENERATED ALWAYS AS IDENTITY,
    ubicacion           VARCHAR2(50),
    fecha_llegada       DATE,
    fecha_salida        DATE,
    victimas_id_victima INTEGER NOT NULL
)`);
    result = await connection.execute(`ALTER TABLE ubicaciones ADD CONSTRAINT ubicaciones_pk PRIMARY KEY ( id_ubicacion )`);
    result = await connection.execute(`ALTER TABLE ubicaciones
    ADD CONSTRAINT ubicaciones_victimas_fk FOREIGN KEY ( victimas_id_victima )
        REFERENCES victimas ( id_victima )`);

    result = await connection.execute(`CREATE TABLE allegados (
      id_asociado        INTEGER GENERATED ALWAYS AS IDENTITY,
      nombre             VARCHAR2(50),
      apellidos          VARCHAR2(50)
  )`);
    result = await connection.execute(`ALTER TABLE allegados ADD CONSTRAINT allegados_pk PRIMARY KEY ( id_asociado )`);

    result = await connection.execute(`CREATE TABLE victimaallegados (
      tipo_contacto         VARCHAR2(30),
      fecha_conocimiento DATE,
      fecha_inicio_contacto DATE,
      fecha_fin_contacto    DATE,
      allegados_id_asociado INTEGER NOT NULL,
      victimas_id_victima   INTEGER NOT NULL
  )`);
    result = await connection.execute(`ALTER TABLE victimaallegados
    ADD CONSTRAINT victimaallegados_allegados_fk FOREIGN KEY ( allegados_id_asociado )
        REFERENCES allegados ( id_asociado)`);
    result = await connection.execute(`ALTER TABLE victimaallegados
    ADD CONSTRAINT victimaallegados_victimas_fk FOREIGN KEY ( victimas_id_victima )
        REFERENCES victimas ( id_victima )`);


    result = await connection.execute(`INSERT INTO hospitales (DIRECCION_HOSPITAL, NOMBRE_HOSPITAL)
      SELECT DISTINCT 
      DIRECCION_HOSPITAL,
      NOMBRE_HOSPITAL
      FROM tabla_temporal
      WHERE DIRECCION_HOSPITAL IS NOT NULL AND NOMBRE_HOSPITAL IS NOT NULL
      `);
      connection.commit()
    result = await connection.execute(`
      INSERT INTO victimas(NOMBRE_VICTIMA, APELLIDO_VICTIMA, DIRECCION_VICTIMA, FECHA_MUERTE,
      FECHA_PRIMERA_SOSPECHA , FECHA_CONFIRMACION, ESTATUS_ENFERMEDAD, HOSPITALES_ID_HOSPITAL)
      SELECT DISTINCT
        tt.NOMBRE_VICTIMA,
        tt.APELLIDO_VICTIMA,
        tt.DIRECCION_VICTIMA,
        tt.FECHA_MUERTE,
        tt.FECHA_PRIMERA_SOSPECHA,
        tt.FECHA_CONFIRMACION,
        tt.ESTADO_VICTIMA,
        h.ID_HOSPITAL
      FROM TABLA_TEMPORAL tt 
      INNER JOIN HOSPITALES h ON tt.NOMBRE_HOSPITAL = h.NOMBRE_HOSPITAL  
      WHERE tt.NOMBRE_VICTIMA IS NOT NULL AND tt.APELLIDO_VICTIMA IS NOT NULL
    `);
    result = await connection.execute(`
    INSERT INTO TRATAMIENTOS (NOMBRE_TRATAMIENTO, EFECTIVIDAD)
    SELECT DISTINCT 
    TRATAMIENTO, 
    EFECTIVIDAD 
    FROM TABLA_TEMPORAL
    WHERE TRATAMIENTO IS NOT NULL AND EFECTIVIDAD IS NOT NULL
    `);
    result = await connection.execute(`
      INSERT INTO TRATAMIENTOSVICTIMA(VICTIMAS_ID_VICTIMA, TRATAMIENTOS_ID_TRATAMIENTO, 
      EFECTIVIDAD_EN_VICTIMA, FECHA_INICIO_TRATAMIENTO, FECHA_FIN_TRATAMIENTO)
      SELECT DISTINCT 
      v.ID_VICTIMA, 
      t.ID_TRATAMIENTO,
      tt.EFECTIVIDAD_EN_VICTIMA, 
      tt.FECHA_INICIO_TRATAMIENTO,
      tt.FECHA_FIN_TRATAMIENTO
      FROM TABLA_TEMPORAL tt 
      INNER JOIN VICTIMAS v ON v.NOMBRE_VICTIMA  = tt.NOMBRE_VICTIMA AND v.APELLIDO_VICTIMA = tt.APELLIDO_VICTIMA 
      INNER JOIN TRATAMIENTOS t ON t.NOMBRE_TRATAMIENTO  = tt.TRATAMIENTO
    `);
    result = await connection.execute(`
      INSERT INTO UBICACIONES(UBICACION, FECHA_LLEGADA, FECHA_SALIDA, VICTIMAS_ID_VICTIMA)
      SELECT DISTINCT 
      tt.UBICACION_VICTIMA, 
      tt.FECHA_LLEGADA,
      tt.FECHA_RETIRO,
      v.ID_VICTIMA 
      FROM TABLA_TEMPORAL tt 
      INNER JOIN VICTIMAS v ON v.NOMBRE_VICTIMA = tt.NOMBRE_VICTIMA AND v.APELLIDO_VICTIMA = tt.APELLIDO_VICTIMA 
      WHERE tt.UBICACION_VICTIMA IS NOT NULL
    `);
    result = await connection.execute(`
      INSERT INTO ALLEGADOS(NOMBRE, APELLIDOS)
      SELECT DISTINCT 
      tt.NOMBRE_ASOCIADO,
      tt.APELLIDO_ASOCIADO
      FROM TABLA_TEMPORAL tt 
      WHERE tt.NOMBRE_ASOCIADO IS NOT NULL AND tt.APELLIDO_ASOCIADO IS NOT NULL
    `);
    result = await connection.execute(`
      INSERT INTO VICTIMAALLEGADOS(TIPO_CONTACTO, FECHA_CONOCIMIENTO,FECHA_INICIO_CONTACTO,
      FECHA_FIN_CONTACTO, ALLEGADOS_ID_ASOCIADO, VICTIMAS_ID_VICTIMA)
      SELECT DISTINCT 
      tt.CONTACTO_FISICO,
      tt.FECHA_CONOCIO,
      tt.FECHA_INICIO_CONTACTO,
      tt.FECHA_FIN_CONTACTO,
      a.ID_ASOCIADO,
      v.ID_VICTIMA
      FROM TABLA_TEMPORAL tt 
      INNER JOIN ALLEGADOS a ON a.NOMBRE = tt.NOMBRE_ASOCIADO AND a.APELLIDOS = tt.APELLIDO_ASOCIADO
      INNER JOIN VICTIMAS v ON v.NOMBRE_VICTIMA = tt.NOMBRE_VICTIMA AND V.APELLIDO_VICTIMA = tt.APELLIDO_VICTIMA 
      WHERE TT.CONTACTO_FISICO IS NOT NULL
      `);
      connection.commit()
      return res.status(200).json({ mensaje: "Modelo Cargado Exitosamente" });
  } catch (e) {
    return res.status(200).json({ e });
  }
}


async function cargarTemporal(req, res) {

  try {
    const connection = await getConnection();
    const result = await connection.execute(queries.cargarTemporal);

    const { exec } = require('child_process');
    const comandoSqlldr = `sqlldr userid=PROYECTO1BASES1/05013007@192.168.0.10:1521/XE control=[BD1]ArchivoControl.ctl`;

    exec(comandoSqlldr, { cwd: './Command' }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar el comando: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error al ejecutar el comando: ${stderr}`);
        return;
      }
      console.log(`Comando ejecutado exitosamente: ${stdout}`);
    });


    return res.status(200).json({ mensaje: "Carga de Tabla temporal Ejecutada Exitosamente" });
  } catch (e) {
    return res.status(200).json({ e });
  }

}


module.exports = {
  eliminarTemporal,
  eliminarModelo,
  cargarTemporal,
  cargarModelo,
  consulta
}
