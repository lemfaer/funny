CREATE TABLE text (
	id          INTEGER           NOT NULL AUTO_INCREMENT PRIMARY KEY,
	text        TEXT              CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
	class       VARCHAR(255)      NOT NULL,
	sha256      VARCHAR(64)       NOT NULL UNIQUE KEY,
	temp        ENUM("YES", "NO") NOT NULL DEFAULT "YES",
	created     TIMESTAMP         NOT NULL DEFAULT now(),
	updated     TIMESTAMP         NOT NULL DEFAULT now() ON UPDATE now()
)

ENGINE = MyISAM;
