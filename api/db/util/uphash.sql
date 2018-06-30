CREATE TRIGGER uphash BEFORE UPDATE ON text
FOR EACH ROW SET NEW.sha256 = sha2(NEW.text, 256);