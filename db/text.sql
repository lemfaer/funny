CREATE TABLE text (
	id          INTEGER           NOT NULL AUTO_INCREMENT PRIMARY KEY,
	text        TEXT              NOT NULL,
	class       VARCHAR(255)      NOT NULL,
	temp        ENUM("YES", "NO") NOT NULL DEFAULT "YES",
	created     TIMESTAMP         NOT NULL DEFAULT now(),
	updated     TIMESTAMP         NOT NULL DEFAULT now() ON UPDATE now()
)

ENGINE = MyISAM;
