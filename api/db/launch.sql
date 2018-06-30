CREATE TABLE launch (
	id          INTEGER           NOT NULL AUTO_INCREMENT PRIMARY KEY,
	type        VARCHAR(255)      NOT NULL,
	report      JSON              NULL,
	created     TIMESTAMP         NOT NULL DEFAULT now(),
	updated     TIMESTAMP         NOT NULL DEFAULT now() ON UPDATE now()
)

ENGINE = MyISAM;
