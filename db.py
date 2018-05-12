import json
from mysql.connector import connect

def select_lcount(cnx, script):
	if script:
		return select_lcount_recur(cnx, script)

	cursor = cnx.cursor()
	cursor.execute("SELECT count(*) FROM page")
	return int(cursor.fetchone()[0])

def select_lcount_recur(cnx, recurrence):
	cursor = cnx.cursor()
	cursor.execute("SELECT count(*) FROM page WHERE recurrence = %s", [recurrence])
	return int(cursor.fetchone()[0])

def select_avg(cnx):
	cursor = cnx.cursor()
	cursor.execute("SELECT avg(time), count(*) FROM stats WHERE type IN ('parser', 'follow')")
	return cursor.fetchone()

def select_links(cnx, script):
	if script:
		return select_links_recur(cnx, script)

	cursor = cnx.cursor(buffered=True)
	cursor.execute("SELECT link, normal, positive, negative, unknown, rremove FROM page")
	return cursor

def select_links_recur(cnx, recurrence):
	cursor = cnx.cursor(buffered=True)
	cursor.execute("""
		SELECT link, normal, positive, negative, unknown, rremove
		FROM page WHERE recurrence = %s
	""", [recurrence])
	return cursor

def insert_launch(cnx, type):
	cursor = cnx.cursor()
	cursor.execute("INSERT INTO launch SET type = %s", [type])
	lid = cursor.lastrowid
	cursor.close()
	cnx.commit()
	return lid

def delete_launch(cnx, lid):
	cursor = cnx.cursor()
	cursor.execute("DELETE FROM launch WHERE id = %s LIMIT 1", [lid])
	cursor.close()
	cnx.commit()

def delete_texts(cnx):
	cursor = cnx.cursor()
	cursor.execute("DELETE FROM text WHERE temp = 'YES'")
	cursor.close()
	cnx.commit()

def select_unique(cnx, page):
	cursor = cnx.cursor()
	hashes = [ [hash] for hash in page.hash() ]
	cursor.execute("CREATE TEMPORARY TABLE hashes (sha256 VARCHAR(255))")
	cursor.executemany("INSERT INTO hashes SET sha256 = %s", hashes)
	cursor.execute("""
		SELECT a.sha256 FROM hashes AS a
		LEFT JOIN text AS b ON a.sha256 = b.sha256
		WHERE b.sha256 IS NULL;
	""")
	unique = [ row[0] for row in cursor ]
	cursor.execute("DROP TEMPORARY TABLE hashes")
	return unique

def insert_texts(cnx, page):
	cursor = cnx.cursor()
	cursor.executemany("INSERT IGNORE INTO text (text, class, temp) VALUES (%s, %s, 'YES')", page.export())
	cursor.close()
	cnx.commit()

def insert_stats(cnx, lid, type, stats):
	cursor = cnx.cursor()
	cursor.execute("INSERT INTO stats SET launch_id = %s, type = %s, time = %s, eta = %s, info = %s",
		(lid, type, stats["time"], stats["eta"], json.dumps(stats)))
	cursor.close()
	cnx.commit()

def update_launch(cnx, lid, report):
	cursor = cnx.cursor()
	cursor.execute("UPDATE launch SET report = %s WHERE id = %s LIMIT 1", (json.dumps(report), lid))
	cursor.close()
	cnx.commit()
