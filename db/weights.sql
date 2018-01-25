CREATE TABLE weights (
	id          INTEGER           NOT NULL AUTO_INCREMENT PRIMARY KEY,
	type        VARCHAR(255)      NOT NULL,
	launch_id   INTEGER           NOT NULL,
	b           FLOAT             NOT NULL,
	alpha       JSON              NOT NULL,
	data        JSON              NOT NULL
)

ENGINE = MyISAM;
