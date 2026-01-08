import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- POKOJE ---
app.get("/api/rooms", async (req, res) => {
    const { checkIn, checkOut } = req.query;
    console.log("--- Sprawdzanie dostępności (z oznaczaniem zajętych) ---");

    try {
        let query = "";
        let params = [];

        if (checkIn && checkOut) {
            query = `
                SELECT r.*, 
                (
                    SELECT COUNT(*) 
                    FROM reservations res 
                    WHERE res.RoomID = r.RoomID 
                    AND res.Status = 'Confirmed'
                    AND (
                        (res.CheckIn <= ? AND res.CheckOut >= ?) OR
                        (res.CheckIn >= ? AND res.CheckIn < ?) OR
                        (res.CheckOut > ? AND res.CheckOut <= ?)
                    )
                ) as IsBooked
                FROM rooms r
                WHERE r.IsActive = 1
            `;
            params = [checkOut, checkIn, checkIn, checkOut, checkIn, checkOut];
        } else {
            query = `SELECT *, 0 as IsBooked FROM rooms WHERE IsActive = 1`;
        }

        const [rows] = await db.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error(`Błąd pobierania pokoi: ${error}`);
        res.status(500).json({ error: "Błąd serwera" });
    }
});

// --- USŁUGI DODATKOWE ---
app.get("/api/services", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM services");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
});

// --- REZERWACJE ---
app.post("/api/reservations", async (req, res) => {
    const { firstName, lastName, email, phone, roomId, checkIn, checkOut, price, adults, selectedServices } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let guestId;
        const [existingGuests] = await connection.query("SELECT GuestID FROM guests WHERE Email = ?", [email]);
        if (existingGuests.length > 0) {
            guestId = existingGuests[0].GuestID;
        } else {
            const [guestResult] = await connection.query(
                "INSERT INTO guests (FirstName, LastName, Email, Phone) VALUES (?, ?, ?, ?)",
                [firstName, lastName, email, phone]
            );
            guestId = guestResult.insertId;
        }

        const [reservationResult] = await connection.query(
            `INSERT INTO reservations (GuestID, RoomID, CheckIn, CheckOut, Status, Price, Adults) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [guestId, roomId, checkIn, checkOut, 'Confirmed', price, adults]
        );
        const reservationId = reservationResult.insertId;

        if (selectedServices && selectedServices.length > 0) {
            const serviceValues = selectedServices.map(serviceId => [reservationId, serviceId, 1]);
            await connection.query(
                "INSERT INTO reservation_services (ReservationID, ServiceID, Quantity) VALUES ?",
                [serviceValues]
            );
        }

        await connection.commit();
        res.status(201).json({ message: "Rezerwacja utworzona", reservationId });

    } catch (error) {
        await connection.rollback();
        console.error(`Błąd rezerwacji: ${error}`);
        res.status(500).json({ error: "Błąd serwera" });
    } finally {
        connection.release();
    }
});

app.get("/api/reservations/:id", async (req, res) => {
    const reservationId = req.params.id;

    try {
        const [rows] = await db.query(`
            SELECT r.*, g.FirstName, g.LastName, g.Email, g.Phone, rm.Name as RoomName, rm.ImageURL, rm.Type 
            FROM reservations r
            JOIN guests g ON r.GuestID = g.GuestID
            JOIN rooms rm ON r.RoomID = rm.RoomID
            WHERE r.ReservationID = ?
        `, [reservationId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Nie znaleziono rezerwacji o takim numerze." });
        }

        const reservation = rows[0];

        const [services] = await db.query(`
            SELECT s.Name, s.Price 
            FROM reservation_services rs
            JOIN services s ON rs.ServiceID = s.ServiceID
            WHERE rs.ReservationID = ?
        `, [reservationId]);

        res.json({ ...reservation, services });

    } catch (error) {
        console.error(`Błąd pobierania rezerwacji: ${error}`);
        res.status(500).json({ error: "Błąd serwera" });
    }
});

// --- ADMINISTRACJA REZERWACJAMI ---
app.get("/api/admin/reservations", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, g.FirstName, g.LastName, g.Email, rm.RoomNumber 
            FROM reservations r
            JOIN guests g ON r.GuestID = g.GuestID
            JOIN rooms rm ON r.RoomID = rm.RoomID
            ORDER BY r.CheckIn DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
});

app.delete("/api/reservations/:id", async (req, res) => {
    const reservationId = req.params.id;

    try {
        await db.query("DELETE FROM reservation_services WHERE ReservationID = ?", [reservationId]);
        const [result] = await db.query("DELETE FROM reservations WHERE ReservationID = ?", [reservationId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Nie znaleziono takiej rezerwacji" });
        }
        res.json({ message: "Rezerwacja i powiązane usługi zostały usunięte" });

    } catch (error) {
        console.error("Błąd usuwania rezerwacji:", error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(400).json({ error: "Nie można usunąć rezerwacji, ponieważ jest powiązana z innymi danymi (np. płatnościami)." });
        } else {
            res.status(500).json({ error: "Błąd serwera podczas usuwania" });
        }
    }
});

app.put("/api/reservations/:id", async (req, res) => {
    const { Status, RoomID, CheckIn, CheckOut } = req.body;
    try {
        await db.query(
            "UPDATE reservations SET Status = ?, RoomID = ?, CheckIn = ?, CheckOut = ? WHERE ReservationID = ?",
            [Status, RoomID, CheckIn, CheckOut, req.params.id]
        );
        res.json({ message: "Zaktualizowano" });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
});

// --- WYDARZENIA ---

// Pobierz wydarzenia wraz z nazwą sali
app.get("/api/events", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*, v.Name as VenueName 
            FROM events e 
            LEFT JOIN venues v ON e.VenueID = v.VenueID 
            ORDER BY e.StartDate ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
});

app.post("/api/events", async (req, res) => {
    const { Name, Description, StartDate, EndDate, VenueID } = req.body;
    try {
        await db.query(
            "INSERT INTO events (Name, Description, StartDate, EndDate, VenueID) VALUES (?, ?, ?, ?, ?)",
            [Name, Description, StartDate, EndDate, VenueID]
        );
        res.status(201).json({ message: "Dodano wydarzenie" });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
});

app.delete("/api/events/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM events WHERE EventID = ?", [req.params.id]);
        res.json({ message: "Usunięto wydarzenie" });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
});

// Endpoint pomocniczy: Lista sal (do dropdownu w panelu admina)
app.get("/api/venues", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM venues");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
});

// --- LOGOWANIE ---
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query("SELECT * FROM users WHERE Username = ? AND Password = ?", [username, password]);
        if (users.length > 0) {
            const user = users[0];
            res.json({ success: true, user: { id: user.UserID, username: user.Username, role: user.Role } });
        } else {
            res.status(401).json({ success: false, message: "Błędne dane" });
        }
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
});

// --- ZARZĄDZANIE UŻYTKOWNIKAMI (CRUD) ---

app.get("/api/users", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT UserID, Username, Role, Password FROM users");
        res.json(rows);
    } catch (error) {
        console.error("Błąd pobierania użytkowników:", error);
        res.status(500).json({ error: "Błąd serwera" });
    }
});

app.post("/api/users", async (req, res) => {
    const { Username, Password, Role } = req.body;
    try {
        const [existing] = await db.query("SELECT UserID FROM users WHERE Username = ?", [Username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: "Użytkownik o takim loginie już istnieje." });
        }

        await db.query(
            "INSERT INTO users (Username, Password, Role) VALUES (?, ?, ?)",
            [Username, Password, Role]
        );
        res.status(201).json({ message: "Użytkownik dodany" });
    } catch (error) {
        console.error("Błąd dodawania użytkownika:", error);
        res.status(500).json({ error: "Błąd serwera" });
    }
});

app.put("/api/users/:id", async (req, res) => {
    const { Username, Password, Role } = req.body;
    const userId = req.params.id;

    try {
        await db.query(
            "UPDATE users SET Username = ?, Password = ?, Role = ? WHERE UserID = ?",
            [Username, Password, Role, userId]
        );
        res.json({ message: "Dane użytkownika zaktualizowane" });
    } catch (error) {
        console.error("Błąd edycji użytkownika:", error);
        res.status(500).json({ error: "Błąd serwera" });
    }
});

app.delete("/api/users/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM users WHERE UserID = ?", [req.params.id]);
        res.json({ message: "Użytkownik usunięty" });
    } catch (error) {
        console.error("Błąd usuwania użytkownika:", error);
        res.status(500).json({ error: "Błąd serwera" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});