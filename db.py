import json
from mysql.connector import connect

def select_tcount(cnx):
	cursor = cnx.cursor()
	cursor.execute("SELECT count(*) FROM text")
	return int(cursor.fetchone()[0])

def select_pavg(cnx):
	cursor = cnx.cursor()
	cursor.execute("""
		SELECT
			sum(@n := json_extract(info, '$.texts')),
			avg(time / @n)
		FROM stats
		WHERE type = 'classifier'
			AND json_contains(info, '"prepare"', '$.stage')
	""")
	return cursor.fetchone()

def select_tavg(cnx, mode, modifier):
	cursor = cnx.cursor()
	cursor.execute("""
		SELECT
			sum(@n := json_extract(info, '$.operations')),
			sum(json_extract(info, '$.iterations')),
			avg(time / (@n * %s))
		FROM stats
		WHERE type = 'classifier'
			AND json_contains(info, %s, '$.stage')
	""", (modifier, '"%s"' % mode))
	return cursor.fetchone()

def select_texts(cnx):
	cursor = cnx.cursor(buffered=True)
	cursor.execute("SELECT id, text, class FROM text")
	return cursor

def insert_launch(cnx):
	cursor = cnx.cursor()
	cursor.execute("INSERT INTO launch SET type = 'classifier'")
	lid = cursor.lastrowid
	cursor.close()
	cnx.commit()
	return lid

def insert_stats(cnx, lid, stats):
	cursor = cnx.cursor()
	cursor.execute("INSERT INTO stats SET type = 'classifier', launch_id = %s, time = %s, eta = %s, info = %s",
		(lid, stats["time"], stats["eta"], json.dumps(stats)))

	cursor.close()
	cnx.commit()

def insert_index(cnx, lid, type, index):
	data = json.dumps(index.export())

	cursor = cnx.cursor()
	cursor.execute("""
		INSERT INTO iindex SET type = %s, launch_id = %s, data = %s
		ON DUPLICATE KEY UPDATE launch_id = %s, data = %s
	""", (type, lid, data, lid, data))

	cursor.close()
	cnx.commit()

def store_result(cnx, lid, type, b, alpha, data):
	cursor = cnx.cursor()
	cursor.execute("INSERT INTO weights SET type = %s, launch_id = %s, b = %s, alpha = %s, data = %s",
		(type, lid, b, json.dumps(alpha), json.dumps(data)))

	cursor.close()
	cnx.commit()

def update_launch(cnx, lid, report):
	cursor = cnx.cursor()
	cursor.execute("UPDATE launch SET report = %s WHERE id = %s LIMIT 1", (json.dumps(report), lid))
	cursor.close()
	cnx.commit()

