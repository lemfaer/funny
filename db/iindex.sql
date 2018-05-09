CREATE TABLE iindex (
	id          INTEGER           NOT NULL AUTO_INCREMENT PRIMARY KEY,
	type        VARCHAR(255)      NOT NULL,
	launch_id   INTEGER           NOT NULL,
	data        JSON              NOT NULL,
	created     TIMESTAMP         NOT NULL DEFAULT now(),
	updated     TIMESTAMP         NOT NULL DEFAULT now() ON UPDATE now()
)

ENGINE = MyISAM;
