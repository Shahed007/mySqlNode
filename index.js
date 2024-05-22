const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// CORS option
const corsOption = {
  origin: ["http://localhost:5173"],
  optionsSuccessStatus: 200,
};

// Middleware
app.use(express.json());
app.use(cors(corsOption));

// Connect with MySQL database
async function main() {
  // Create a connection to the database
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root", // replace with your MySQL username
    password: "shahed007@", // replace with your MySQL password
    database: "mytodo", // replace with your database name
  });

  console.log("Database connected successfully");

  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        todo_description TEXT NOT NULL,
        email VARCHAR(100) NOT NULL,
        current_status VARCHAR(55) NOT NULL,
        assign_date DATE NOT NULL
      )
    `;

    await connection.execute(createTableQuery);
    console.log("Table 'todos' created or already exists");

    app.post("/todo", async (req, res) => {
      const { title, todo_description, email, current_status, assign_date } =
        req.body;

      try {
        const insertQuery = `
        INSERT INTO todos (title, todo_description, email, current_status, assign_date)
        VALUES (?, ?, ?, ?, ?)
      `;
        const [result] = await connection.execute(insertQuery, [
          title,
          todo_description,
          email,
          current_status,
          assign_date,
        ]);

        await connection.end();
        console.log("data added successfully");

        res.status(201).send({
          id: result.insertId,
          message: "success",
        });
      } catch (err) {
        console.error("Error inserted id: ", err);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.get("/todos", async (req, res) => {
      const id = req.query.id;
      const todosQuery = `SELECT * FROM todos`;

      try {
        if (id) {
          const queryById = `
           SELECT * FROM todos
           WHERE id = ?;
          `;

          const [rows] = await connection.execute(queryById, [id]);

          rows.length === 0
            ? res.status(400).send({ message: "Todo not found" })
            : res.status(200).send(rows);
        } else {
          const [rows] = await connection.execute(todosQuery);

          res.status(200).send(rows);
        }
      } catch (error) {
        console.error("Server error: ", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.put("/todo/:id", async (req, res) => {
      const { id } = req.params;
      const { current_status } = req.body;
      console.log(current_status);
      try {
        const updateQuery = `
        UPDATE todos
        SET current_status = ?
        WHERE id = ?
      `;

        const [result] = await connection.execute(updateQuery, [
          current_status,
          id,
        ]);

        if (result.affectedRows > 0) {
          res.status(200).send({ message: "Status updated successfully" });
        } else {
          res.status(400).send({ message: "Todo not found" });
        }
      } catch (error) {
        console.error("Error updating current_status:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/todo/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const deleteQuery = `
          DELETE FROM todos
          WHERE id = ?
        `;
        const [result] = await connection.execute(deleteQuery, [id]);
        if (result.affectedRows > 0) {
          res.status(200).send({ message: "Todo  successfully deleted" });
        } else {
          res.status(400).send({ message: "Todo not found" });
        }
      } catch (error) {
        console.log("Server error: ", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // Example query
    const [rows, fields] = await connection.execute(`SELECT 1 + 1 AS solution`);
    console.log("The solution is: ", rows[0].solution);
  } catch (err) {
    console.error("Error execute query:", err);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
