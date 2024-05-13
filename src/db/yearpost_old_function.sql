CREATE OR REPLACE FUNCTION "public"."create_post_data_table"("_year" int4, "_postid" int4)
  RETURNS "pg_catalog"."void" AS $BODY$
DECLARE myschema VARCHAR(100):='year_' || _year;
DECLARE mytable varchar(100):= 'post_' || _year || '_' || _postid;
DECLARE createqry text;
DECLARE keyidx text;
BEGIN
	 
	 IF NOT EXISTS(
        SELECT schema_name
          FROM information_schema.schemata
          WHERE schema_name = myschema
      )
    THEN
			createqry :=format('CREATE SCHEMA %I',myschema);
			RAISE NOTICE 'Create Schema : %', createqry;
      EXECUTE format('CREATE SCHEMA %I',myschema);
    END IF;
	  IF NOT EXISTS(SELECT * FROM information_schema.tables WHERE table_name = myschema || '.' || mytable) THEN
	 
	 createqry := format('CREATE TABLE IF NOT EXISTS "%I".%I (
					appid int8 NOT NULL,
					post_module_id int4 NOT NULL,
					post_id int4 not null,
					module_id int4 not null,
					module_type int2 not null,
					cdid int4 NOT NULL,
					module_data jsonb,
					specializations jsonb
				)', myschema,mytable);
		 RAISE NOTICE 'Create qry : %', createqry;
		 /* For Debug Message
		 RAISE NOTICE 'Create qry : %', createqry;
		 %I will be used without quote %L with Quote
		 */
		 EXECUTE createqry;
		 createqry := format('ALTER TABLE "%I".%I ADD CONSTRAINT %I PRIMARY KEY (appid,post_module_id,cdid)', myschema,mytable,mytable || '_pkey');
		 EXECUTE createqry;
		 createqry := format('CREATE INDEX %I ON "%I".%I USING gin (module_data)',mytable ||'_md_gin',myschema, mytable);
		 EXECUTE createqry;
		END IF;
		RAISE NOTICE 'Finshed';
END
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100