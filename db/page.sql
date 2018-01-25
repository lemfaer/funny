CREATE TABLE page (
	id          INTEGER           NOT NULL AUTO_INCREMENT PRIMARY KEY,
	link        VARCHAR(255)      NOT NULL,
	normal      VARCHAR(255)      NULL,
	positive    VARCHAR(255)      NULL,
	negative    VARCHAR(255)      NULL,
	rremove     VARCHAR(255)      NULL,
	created     TIMESTAMP         NOT NULL DEFAULT now(),
	updated     TIMESTAMP         NOT NULL DEFAULT now() ON UPDATE now()
)

ENGINE = MyISAM;
