CREATE TABLE hospitales (
    id_hospital        INTEGER GENERATED ALWAYS AS IDENTITY,
    direccion_hospital VARCHAR2(50),
    nombre_hospital    VARCHAR2(50)
);

ALTER TABLE hospitales ADD CONSTRAINT hospitales_pk PRIMARY KEY ( id_hospital );



CREATE TABLE victimas (
    id_victima             INTEGER GENERATED ALWAYS AS IDENTITY,
    nombre_victima         VARCHAR2(50),
    apellido_victima       VARCHAR2(50),
    direccion_victima      VARCHAR2(50),
    fecha_muerte           DATE,
    fecha_primera_sospecha DATE,
    fecha_confirmacion DATE,
    estatus_enfermedad     VARCHAR2(50),
    hospitales_id_hospital INTEGER NOT NULL
);

ALTER TABLE victimas ADD CONSTRAINT victimas_pk PRIMARY KEY ( id_victima );

ALTER TABLE victimas
    ADD CONSTRAINT victimas_hospitales_fk FOREIGN KEY ( hospitales_id_hospital )
        REFERENCES hospitales ( id_hospital );
       
       

CREATE TABLE tratamientos (
    id_tratamiento     INTEGER GENERATED ALWAYS AS IDENTITY,
    nombre_tratamiento VARCHAR2(50),
    efectividad        INTEGER
);

ALTER TABLE tratamientos ADD CONSTRAINT tratamientos_pk PRIMARY KEY ( id_tratamiento );


       
CREATE TABLE tratamientosvictima (
    id_tratamientos_victima     INTEGER GENERATED ALWAYS AS IDENTITY,
    victimas_id_victima         INTEGER NOT NULL,
    tratamientos_id_tratamiento INTEGER NOT NULL,
    efectividad_en_victima INTEGER,
    fecha_inicio_tratamiento DATE,
    fecha_fin_tratamiento DATE
);

ALTER TABLE tratamientosvictima ADD CONSTRAINT tratamientosvictima_pk PRIMARY KEY ( id_tratamientos_victima );

ALTER TABLE tratamientosvictima
    ADD CONSTRAINT tratvictima_tratamientos_fk FOREIGN KEY ( tratamientos_id_tratamiento )
        REFERENCES tratamientos ( id_tratamiento );
       
ALTER TABLE tratamientosvictima
    ADD CONSTRAINT tratvictima_victimas_fk FOREIGN KEY ( victimas_id_victima )
        REFERENCES victimas ( id_victima );


       

CREATE TABLE ubicaciones (
    id_ubicacion        INTEGER GENERATED ALWAYS AS IDENTITY,
    ubicacion           VARCHAR2(50),
    fecha_llegada       DATE,
    fecha_salida        DATE,
    victimas_id_victima INTEGER NOT NULL
);

ALTER TABLE ubicaciones ADD CONSTRAINT ubicaciones_pk PRIMARY KEY ( id_ubicacion );

ALTER TABLE ubicaciones
    ADD CONSTRAINT ubicaciones_victimas_fk FOREIGN KEY ( victimas_id_victima )
        REFERENCES victimas ( id_victima );

       

CREATE TABLE allegados (
    id_asociado        INTEGER GENERATED ALWAYS AS IDENTITY,
    nombre             VARCHAR2(50),
    apellidos          VARCHAR2(50)
);

ALTER TABLE allegados ADD CONSTRAINT allegados_pk PRIMARY KEY ( id_asociado );
       


CREATE TABLE victimaallegados (
    tipo_contacto         VARCHAR2(30),
    fecha_conocimiento DATE,
    fecha_inicio_contacto DATE,
    fecha_fin_contacto    DATE,
    allegados_id_asociado INTEGER NOT NULL,
    victimas_id_victima   INTEGER NOT NULL
);
ALTER TABLE victimaallegados
    ADD CONSTRAINT victimaallegados_allegados_fk FOREIGN KEY ( allegados_id_asociado )
        REFERENCES allegados ( id_asociado);
       
       ALTER TABLE victimaallegados
    ADD CONSTRAINT victimaallegados_victimas_fk FOREIGN KEY ( victimas_id_victima )
        REFERENCES victimas ( id_victima );















