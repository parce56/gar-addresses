require('dotenv').config()
const dbConfig = require('./config')
const { Pool } = require('pg')
const schema =  process.env.DB_SCHEMA || 'public'
const work_mem = parseInt(process.env.MVR_WORK_MEM, 10) || 4
const maintenance_work_mem = parseInt(process.env.MVR_MAINTENANCE_WORK_MEM, 10) || 64

async function initializeDatabase() {
    const adminPool = new Pool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: process.env.DB_ADMIN_NAME
    })
    try {
        const dbCheck = await adminPool.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = $1`, [dbConfig.database])
        if (dbCheck.rows.length === 0) {
            console.log(`Создание базы данных: ${dbConfig.database}.`)
            await adminPool.query(`CREATE DATABASE ${dbConfig.database}`)
            console.log(`База данных ${dbConfig.database} успешно создана.`)
        }
        const pool = new Pool(dbConfig)
        await createTables(pool, schema)
        await createMaterializedViews(pool, schema)
        await createIndexes(pool, schema)
        await pool.end()
    } catch (error) {
        console.error('Ошибка инициализации базы данных:', error)
        throw error
    } finally {
        await adminPool.end()
        console.log('База данных инициализирована.')
    }
}

async function createTables(pool, schema) {
    const client = await pool.connect()
    try {
        console.log('Начало создания таблиц базы данных.')
        await client.query('BEGIN')
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.addrobjs
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                objectguid character varying(36) COLLATE pg_catalog."default" NOT NULL,
                changeid bigint NOT NULL,
                name character varying(250) COLLATE pg_catalog."default" NOT NULL,
                typename character varying(50) COLLATE pg_catalog."default" NOT NULL,
                level character varying(10) COLLATE pg_catalog."default" NOT NULL,
                opertypeid character varying(2) COLLATE pg_catalog."default" NOT NULL,
                previd bigint,
                nextid bigint,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactual smallint NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT addrobj_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.addrobjs OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.addrobjdivision
            (
                id bigint NOT NULL,
                parentid bigint NOT NULL,
                childid bigint NOT NULL,
                changeid bigint NOT NULL,
                CONSTRAINT addrobjdivision_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.addrobjdivision OWNER to ${dbConfig.user};    
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.addrobjtypes
            (
                id bigint NOT NULL,
                level character varying(10) COLLATE pg_catalog."default" NOT NULL,
                shortname character varying(50) COLLATE pg_catalog."default" NOT NULL,
                name character varying(250) COLLATE pg_catalog."default" NOT NULL,
                "desc" character varying(250) COLLATE pg_catalog."default",
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT addrobjtypes_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.addrobjtypes OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.admhierarchy
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                parentobjid bigint,
                changeid bigint NOT NULL,
                regioncode character varying(4) COLLATE pg_catalog."default",
                areacode character varying(4) COLLATE pg_catalog."default",
                citycode character varying(4) COLLATE pg_catalog."default",
                placecode character varying(4) COLLATE pg_catalog."default",
                plancode character varying(4) COLLATE pg_catalog."default",
                streetcode character varying(4) COLLATE pg_catalog."default",
                previd bigint,
                nextid bigint,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactive smallint NOT NULL,
                path character varying COLLATE pg_catalog."default" NOT NULL,
                CONSTRAINT admhierarchy_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.admhierarchy OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.apartmenttypes
            (
                id bigint NOT NULL,
                name character varying(100) COLLATE pg_catalog."default" NOT NULL,
                shortname character varying(50) COLLATE pg_catalog."default",
                "desc" character varying(250) COLLATE pg_catalog."default",
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT apartmenttypes_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.apartmenttypes OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.apartments
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                objectguid character varying(36) COLLATE pg_catalog."default" NOT NULL,
                changeid bigint NOT NULL,
                "number" character varying(50) COLLATE pg_catalog."default" NOT NULL,
                aparttype smallint NOT NULL,
                opertypeid smallint NOT NULL,
                previd bigint,
                nextid bigint,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactual smallint NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT apartments_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.apartments OWNER to ${dbConfig.user};
        `)

        await client.query(`
           CREATE TABLE IF NOT EXISTS ${schema}.carplaces
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                objectguid character varying(36) COLLATE pg_catalog."default" NOT NULL,
                changeid bigint NOT NULL,
                "number" character varying(50) COLLATE pg_catalog."default" NOT NULL,
                opertypeid smallint NOT NULL,
                previd bigint,
                nextid bigint,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactual smallint NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT carplaces_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.carplaces OWNER to ${dbConfig.user}; 
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.changehistory
            (
                changeid bigint NOT NULL,
                objectid bigint NOT NULL,
                adrobjectid character varying(36) COLLATE pg_catalog."default" NOT NULL,
                opertypeid bigint NOT NULL,
                ndocid bigint,
                changedate date NOT NULL,
                CONSTRAINT changehistory_pkey PRIMARY KEY (changeid)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.changehistory OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.addhousetypes
            (
                id bigint NOT NULL,
                name character varying(50) COLLATE pg_catalog."default" NOT NULL,
                shortname character varying(20) COLLATE pg_catalog."default",
                "desc" character varying(250) COLLATE pg_catalog."default",
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT addhousetypes_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.addhousetypes OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.housetypes
            (
                id bigint NOT NULL,
                name character varying(50) COLLATE pg_catalog."default" NOT NULL,
                shortname character varying(20) COLLATE pg_catalog."default",
                "desc" character varying(250) COLLATE pg_catalog."default",
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT housetypes_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.housetypes OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.houses
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                objectguid character varying COLLATE pg_catalog."default" NOT NULL,
                changeid bigint NOT NULL,
                housenum character varying(50) COLLATE pg_catalog."default",
                addnum1 character varying(50) COLLATE pg_catalog."default",
                addnum2 character varying(50) COLLATE pg_catalog."default",
                housetype smallint,
                addtype1 smallint,
                addtype2 smallint,
                opertypeid smallint NOT NULL,
                previd bigint,
                nextid bigint,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactual smallint NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT houses_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.houses OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.munhierarchy
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                parentobjid bigint,
                changeid bigint NOT NULL,
                oktmo character varying(11) COLLATE pg_catalog."default" NOT NULL,
                previd bigint,
                nextid bigint,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactive smallint NOT NULL,
                path character varying COLLATE pg_catalog."default" NOT NULL,
                CONSTRAINT munhierarchy_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.munhierarchy OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.normativedocs
            (
                id bigint NOT NULL,
                name character varying(8000) COLLATE pg_catalog."default" NOT NULL,
                date date NOT NULL,
                "number" character varying(150) COLLATE pg_catalog."default" NOT NULL,
                type bigint NOT NULL,
                kind bigint NOT NULL,
                updatedate date NOT NULL,
                orgname character varying(500) COLLATE pg_catalog."default",
                regnum character varying(100) COLLATE pg_catalog."default",
                regdate date,
                accdate date,
                comment character varying(8000) COLLATE pg_catalog."default",
                CONSTRAINT normativedocs_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.normativedocs OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.normativedocskinds
            (
                id bigint NOT NULL,
                name character varying(500) COLLATE pg_catalog."default" NOT NULL,
                CONSTRAINT normativedocskinds_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.normativedocskinds OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.normativedocstypes
            (
                id bigint NOT NULL,
                name character varying(500) COLLATE pg_catalog."default" NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                CONSTRAINT normativedocstypes_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.normativedocstypes OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.objectlevels
            (
                level smallint NOT NULL,
                name character varying(250) COLLATE pg_catalog."default" NOT NULL,
                shortname character varying(50) COLLATE pg_catalog."default",
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT objectlevels_pkey PRIMARY KEY (level)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.objectlevels OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.operationtypes
            (
                id smallint NOT NULL,
                name character varying(100) COLLATE pg_catalog."default" NOT NULL,
                shortname character varying(100) COLLATE pg_catalog."default",
                "desc" character varying(250) COLLATE pg_catalog."default",
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT operationtypes_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.operationtypes OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.addrobjparams
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                changeid bigint,
                changeidend bigint,
                typeid smallint NOT NULL,
                value character varying(8000) COLLATE pg_catalog."default" NOT NULL,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                CONSTRAINT addrobjparams_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.addrobjparams OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.apartmentsparams
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                changeid bigint,
                changeidend bigint,
                typeid smallint NOT NULL,
                value character varying(8000) COLLATE pg_catalog."default" NOT NULL,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                CONSTRAINT apartmentsparams_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.apartmentsparams OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.carplacesparams
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                changeid bigint,
                changeidend bigint,
                typeid smallint NOT NULL,
                value character varying(8000) COLLATE pg_catalog."default" NOT NULL,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                CONSTRAINT carplacesparams_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.carplacesparams OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.housesparams
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                changeid bigint,
                changeidend bigint,
                typeid smallint NOT NULL,
                value character varying(8000) COLLATE pg_catalog."default" NOT NULL,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                CONSTRAINT housesparams_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.housesparams OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.roomsparams
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                changeid bigint,
                changeidend bigint,
                typeid smallint NOT NULL,
                value character varying(8000) COLLATE pg_catalog."default" NOT NULL,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                CONSTRAINT roomsparams_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.roomsparams OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.steadsparams
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                changeid bigint,
                changeidend bigint,
                typeid smallint NOT NULL,
                value character varying(8000) COLLATE pg_catalog."default" NOT NULL,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                CONSTRAINT steadsparams_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.steadsparams OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.paramtypes
            (
                id smallint NOT NULL,
                name character varying(50) COLLATE pg_catalog."default" NOT NULL,
                code character varying(50) COLLATE pg_catalog."default" NOT NULL,
                "desc" character varying(120) COLLATE pg_catalog."default",
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT paramtypes_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.paramtypes OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.reestrobjects
            (
                objectid bigint NOT NULL,
                objectguid character varying(36) COLLATE pg_catalog."default" NOT NULL,
                changeid bigint NOT NULL,
                isactive smallint NOT NULL,
                levelid smallint NOT NULL,
                createdate date NOT NULL,
                updatedate date NOT NULL,
                CONSTRAINT reestrobjects_pkey PRIMARY KEY (objectid)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.reestrobjects OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.roomtypes
            (
                id smallint NOT NULL,
                name character varying(100) COLLATE pg_catalog."default" NOT NULL,
                shortname character varying(50) COLLATE pg_catalog."default",
                "desc" character varying(250) COLLATE pg_catalog."default",
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT roomtypes_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.roomtypes OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.rooms
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                objectguid character varying(36) COLLATE pg_catalog."default" NOT NULL,
                changeid bigint,
                number character varying(50) COLLATE pg_catalog."default" NOT NULL,
                roomtype smallint NOT NULL,
                opertypeid smallint NOT NULL,
                previd bigint,
                nextid bigint,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactual smallint,
                isactive smallint,
                CONSTRAINT rooms_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.rooms OWNER to ${dbConfig.user};
        `)
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.steads
            (
                id bigint NOT NULL,
                objectid bigint NOT NULL,
                objectguid character varying(36) COLLATE pg_catalog."default" NOT NULL,
                changeid bigint NOT NULL,
                "number" character varying(250) COLLATE pg_catalog."default" NOT NULL,
                opertypeid smallint NOT NULL,
                previd bigint,
                nextid bigint,
                updatedate date NOT NULL,
                startdate date NOT NULL,
                enddate date NOT NULL,
                isactual smallint NOT NULL,
                isactive smallint NOT NULL,
                CONSTRAINT steads_pkey PRIMARY KEY (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE IF EXISTS ${schema}.steads OWNER to ${dbConfig.user};
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.zipfiles
            (
                versionid bigint NOT NULL,
                sizebytes bigint,
                isdownloaded boolean NOT NULL DEFAULT false,
                ishandled boolean NOT NULL DEFAULT false,
                isfull boolean NOT NULL DEFAULT false,
                directorypath character varying COLLATE pg_catalog."default",
                filename character varying COLLATE pg_catalog."default",
                date date NOT NULL,
                textversion character varying COLLATE pg_catalog."default",
                garxmlfullurl character varying COLLATE pg_catalog."default",
                garxmldeltaurl character varying COLLATE pg_catalog."default",
                CONSTRAINT zipfiles_pkey PRIMARY KEY (versionid)
            )
            TABLESPACE pg_default;

            ALTER TABLE IF EXISTS ${schema}.zipfiles OWNER to postgres;
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.garservice
            (
                id smallint PRIMARY KEY CHECK (id = 1),
                laststart timestamp,
                lastfinish timestamp,
                admhierarchyrefresh boolean DEFAULT false
            )
            TABLESPACE pg_default;

            INSERT INTO ${schema}.garservice (id, laststart, lastfinish, admhierarchyrefresh)
            VALUES (1, null, null, false)
            ON CONFLICT (id) DO NOTHING;            
        `)

        await client.query('END')
        console.log('Таблицы базы данных успешно созданы.')
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Ошибка создания таблиц базы данных:', error)
        throw error
    } finally {
        client.release()
    }
}

async function createMaterializedViews(pool, schema) {
    const client = await pool.connect()
    try {
        console.log('Начало создания материализованных представлений базы данных.')
        await client.query('BEGIN')
        await client.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS ${schema}.admhierarchyaddresses
            TABLESPACE pg_default
            AS
            WITH admhierarchy_latest AS (
                    SELECT DISTINCT ON (admhierarchy.objectid) admhierarchy.*
                    FROM ${schema}.admhierarchy
                    ORDER BY admhierarchy.objectid, admhierarchy.startdate DESC, admhierarchy.enddate DESC
                    ), addrobjs_latest AS (
                    SELECT DISTINCT ON (addrobjs.objectid) addrobjs.*
                    FROM ${schema}.addrobjs
                    ORDER BY addrobjs.objectid, addrobjs.startdate DESC, addrobjs.enddate DESC
                    ), houses_latest AS (
                    SELECT DISTINCT ON (houses.objectid) houses.*
                    FROM ${schema}.houses
                    ORDER BY houses.objectid, houses.startdate DESC, houses.enddate DESC
                    ), apartments_latest AS (
                    SELECT DISTINCT ON (apartments.objectid) apartments.*
                    FROM ${schema}.apartments
                    ORDER BY apartments.objectid, apartments.startdate DESC, apartments.enddate DESC
                    ), rooms_latest AS (
                    SELECT DISTINCT ON (rooms.objectid) rooms.*
                    FROM ${schema}.rooms
                    ORDER BY rooms.objectid, rooms.startdate DESC, rooms.enddate DESC
                    ), steads_latest AS (
                    SELECT DISTINCT ON (steads.objectid) steads.*
                    FROM ${schema}.steads
                    ORDER BY steads.objectid, steads.startdate DESC, steads.enddate DESC
                    ), carplaces_latest AS (
                    SELECT DISTINCT ON (carplaces.objectid) carplaces.*
                    FROM ${schema}.carplaces
                    ORDER BY carplaces.objectid, carplaces.startdate DESC, carplaces.enddate DESC
                    ), housetypes_map AS (
                    SELECT housetypes.id,
                        housetypes.shortname
                    FROM ${schema}.housetypes
                    ), addhousetypes_map AS (
                    SELECT addhousetypes.id,
                        addhousetypes.shortname
                    FROM ${schema}.addhousetypes
                    ), apartmenttypes_map AS (
                    SELECT apartmenttypes.id,
                        apartmenttypes.shortname
                    FROM ${schema}.apartmenttypes
                    ), roomtypes_map AS (
                    SELECT roomtypes.id,
                        roomtypes.shortname
                    FROM ${schema}.roomtypes
                    ), objects AS (
                    SELECT ro.objectid,
                        ro.objectguid,
                        ro.levelid,
                        ro.isactive,
                            CASE
                                WHEN ro.levelid = ANY (ARRAY[1, 2, 3]) THEN 
                                    CASE 
                                        WHEN aol.typename IN ('г.','г','п','п.','г.о.') THEN 
                                            (aol.typename::text || ' '::text) || aol.name::text
                                        ELSE 
                                            (aol.name::text || ' '::text) || aol.typename::text
                                    END
                                WHEN ro.levelid = ANY (ARRAY[4, 5, 6, 7, 8]) THEN (aol.typename::text || ' '::text) || aol.name::text
                                WHEN ro.levelid = 9 THEN 'участок '::text || sl.number::text
                                WHEN ro.levelid = 10 THEN ((COALESCE(htm.shortname, ''::character varying)::text ||
                                CASE
                                    WHEN hl.housenum IS NOT NULL THEN ' '::text || hl.housenum::text
                                    ELSE ''::text
                                END) ||
                                CASE
                                    WHEN ahtm1.shortname IS NOT NULL AND hl.addnum1 IS NOT NULL THEN ((' '::text || ahtm1.shortname::text) || ' '::text) || hl.addnum1::text
                                    ELSE ''::text
                                END) ||
                                CASE
                                    WHEN ahtm2.shortname IS NOT NULL AND hl.addnum2 IS NOT NULL THEN ((' '::text || ahtm2.shortname::text) || ' '::text) || hl.addnum2::text
                                    ELSE ''::text
                                END
                                WHEN ro.levelid = 11 THEN atm.shortname::text || al.number::text
                                WHEN ro.levelid = 12 THEN COALESCE(rtm.shortname, ''::character varying)::text || rl.number::text
                                WHEN ro.levelid = 17 THEN 'машиноместо '::text || cl.number::text
                                ELSE 'неизвестный тип'::text
                            END AS name,
                            CASE
                                WHEN ro.levelid = 1 THEN 1
                                WHEN ro.levelid = ANY (ARRAY[2, 3]) THEN 3
                                WHEN ro.levelid = 5 THEN 5
                                WHEN ro.levelid = ANY (ARRAY[4, 6]) THEN 7
                                WHEN ro.levelid = 7 THEN 9
                                WHEN ro.levelid = 8 THEN 11
                                WHEN ro.levelid = 10 THEN 13
                                WHEN ro.levelid = ANY (ARRAY[9, 11, 17]) THEN 15
                                WHEN ro.levelid = 12 THEN 17
                                ELSE 33
                            END AS normalized_level,
                        ahl.path
                    FROM ${schema}.reestrobjects ro
                        JOIN admhierarchy_latest ahl ON ro.objectid = ahl.objectid
                        LEFT JOIN addrobjs_latest aol ON ro.objectid = aol.objectid AND (ro.levelid = ANY (ARRAY[1, 2, 3, 4, 5, 6, 7, 8]))
                        LEFT JOIN houses_latest hl ON ro.objectid = hl.objectid AND ro.levelid = 10
                        LEFT JOIN housetypes_map htm ON hl.housetype = htm.id
                        LEFT JOIN addhousetypes_map ahtm1 ON hl.addtype1 = ahtm1.id
                        LEFT JOIN addhousetypes_map ahtm2 ON hl.addtype2 = ahtm2.id
                        LEFT JOIN apartments_latest al ON ro.objectid = al.objectid AND ro.levelid = 11
                        LEFT JOIN apartmenttypes_map atm ON al.aparttype = atm.id
                        LEFT JOIN rooms_latest rl ON ro.objectid = rl.objectid AND ro.levelid = 12
                        LEFT JOIN roomtypes_map rtm ON rl.roomtype = rtm.id
                        LEFT JOIN steads_latest sl ON ro.objectid = sl.objectid AND ro.levelid = 9
                        LEFT JOIN carplaces_latest cl ON ro.objectid = cl.objectid AND ro.levelid = 17
                    WHERE ro.levelid = ANY (ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 17])
                    ), path_elements AS (
                    SELECT o_1.objectid AS root_objectid,
                        o_1.path,
                        unnest(string_to_array(o_1.path::text, '.'::text))::bigint AS element_objectid,
                        generate_series(1, array_length(string_to_array(o_1.path::text, '.'::text), 1)) AS pos
                    FROM objects o_1
                    ), path_names AS (
                    SELECT pe.root_objectid,
                        pe.pos,
                        o_1.name AS element_name
                    FROM path_elements pe
                        JOIN objects o_1 ON pe.element_objectid = o_1.objectid
                    ), final_addresses AS (
                    SELECT pn.root_objectid,
                        string_agg(pn.element_name, ', '::text ORDER BY pn.pos) AS full_address
                    FROM path_names pn
                    GROUP BY pn.root_objectid
                    )
            SELECT o.objectid,
                o.objectguid,
                o.levelid,
                o.normalized_level,
                o.isactive,
                o.name,
                o.path,
                fa.full_address
            FROM objects o
                JOIN final_addresses fa ON o.objectid = fa.root_objectid
            WITH NO DATA;

            ALTER TABLE IF EXISTS ${schema}.admhierarchyaddresses
                OWNER TO ${dbConfig.user};
        `)
        await client.query('END')
        console.log('Материализованные представления базы данных успешно созданы.')
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Ошибка создания материализованных представлений базы данных:', error)
        throw error
    } finally {
        client.release()
    }
}

async function createIndexes(pool, schema) {
    const client = await pool.connect()
    try {
        console.log('Начало создания индексов базы данных.')
        await client.query(`
            CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_admhierarchyaddresses_unique_objectid
            ON ${schema}.admhierarchyaddresses USING btree
            (objectid ASC NULLS LAST)
            TABLESPACE pg_default;
        `)
        await client.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admhierarchyaddresses_bm25
            ON ${schema}.admhierarchyaddresses USING bm25
            (objectid, full_address COLLATE pg_catalog."default")
            WITH (key_field='objectid')
            TABLESPACE pg_default;
        `)
        console.log('Индексы базы данных успешно созданы.')
    } catch (error) {
        console.error('Ошибка создания индексов базы данных:', error)
        throw error
    } finally {
        client.release()
    }
}

async function refreshMaterializedViews() {
    const pool = new Pool(dbConfig)
    try {        
        await refreshMaterializedViewAdministrativeHierarchy(pool, schema)
    } catch (error) {
        console.error('Ошибка обновления материализованных представлений базы данных:', error)
        throw error
    } finally {
        await pool.end()
    }
}

async function refreshMaterializedViewAdministrativeHierarchy(pool, schema) {
    const client = await pool.connect()
    try {
        await client.query(`COMMIT;`)
        const check = await client.query(`SELECT relispopulated FROM pg_class WHERE oid = '${schema}.admhierarchyaddresses'::regclass`)
        await client.query(`BEGIN;`)
        await client.query(`SET LOCAL work_mem = '${work_mem}MB';`)
        const check_work_mem = await client.query(`SHOW work_mem;`)
        console.log('Текущий work_mem:', check_work_mem.rows[0].work_mem)
        await client.query(`SET LOCAL maintenance_work_mem = '${maintenance_work_mem}MB';`)
        const check_maintenance_work_mem = await client.query(`SHOW maintenance_work_mem;`)
        console.log('Текущий maintenance_work_mem:', check_maintenance_work_mem.rows[0].maintenance_work_mem)
        if (!check.rows[0]?.relispopulated) {
            console.log('Материализованное представление административной иерархии не заполнено. Выполняем первоначальное обновление без CONCURRENTLY.')
            await client.query(`REFRESH MATERIALIZED VIEW ${schema}.admhierarchyaddresses;`)
        } else {
            console.log('Начало обновления материализованного представления административной иерархии базы данных с CONCURRENTLY.')
            await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${schema}.admhierarchyaddresses;`)
        }
        await client.query(`COMMIT;`)
        console.log('Обновление материализованного представления административной иерархии базы данных завершено.')
        console.log('Начало процесса VACUUM.')
        await client.query('VACUUM admhierarchyaddresses;')
        console.log('Завершение процесса VACUUM.')
    } catch (error) {
        await client.query(`ROLLBACK;`)
        console.error('Ошибка обновления материализованного представления административной иерархии базы данных:', error)
        throw error
    } finally {
        client.release()
    }
}

module.exports = { initializeDatabase, refreshMaterializedViews }