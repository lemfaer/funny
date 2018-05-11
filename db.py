import json
from mysql.connector import connect

def select_lcount(cnx):
	cursor = cnx.cursor()
	cursor.execute("SELECT count(*) FROM page")
	return int(cursor.fetchone()[0])

def select_avg(cnx):
	cursor = cnx.cursor()
	cursor.execute("SELECT avg(time), count(*) FROM stats WHERE type = 'parser'")
	return cursor.fetchone()

def select_links(cnx):
	cursor = cnx.cursor(buffered=True)
	cursor.execute("SELECT link, normal, positive, negative, unknown, rremove FROM page")
	return cursor

def insert_launch(cnx):
	cursor = cnx.cursor()
	cursor.execute("INSERT INTO launch SET type = 'parser'")
	lid = cursor.lastrowid
	cursor.close()
	cnx.commit()
	return lid

def delete_texts(cnx):
	cursor = cnx.cursor()
	cursor.execute("DELETE FROM text WHERE temp = 'YES'")
	cursor.close()
	cnx.commit()

def insert_texts(cnx, page):
	cursor = cnx.cursor()
	cursor.executemany("INSERT INTO text (text, class, temp) VALUES (%s, %s, 'YES')", page.export())
	cursor.close()
	cnx.commit()

def insert_stats(cnx, lid, stats):
	cursor = cnx.cursor()
	cursor.execute("INSERT INTO stats SET type = 'parser', launch_id = %s, time = %s, eta = %s, info = %s",
		(lid, stats["time"], stats["eta"], json.dumps(stats)))

	cursor.close()
	cnx.commit()

def update_launch(cnx, lid, report):
	cursor = cnx.cursor()
	cursor.execute("UPDATE launch SET report = %s WHERE id = %s LIMIT 1", (json.dumps(report), lid))
	cursor.close()
	cnx.commit()
