CREATE TABLE stats (
	id          INTEGER                      NOT NULL AUTO_INCREMENT PRIMARY KEY,
	type        ENUM("parser", "classifier") NOT NULL,
	launch_id   INTEGER                      NOT NULL,
	time        FLOAT                        NOT NULL,
	eta         FLOAT                        NOT NULL,
	info        JSON                         NOT NULL,
	created     TIMESTAMP                    NOT NULL DEFAULT now(),
	updated     TIMESTAMP                    NOT NULL DEFAULT now() ON UPDATE now()
)

ENGINE = MyISAM;
