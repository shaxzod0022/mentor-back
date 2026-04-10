require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const app = express();

const userRoutes = require("./route/user.route");
const courseRoutes = require("./route/course.route");
const materialRoutes = require("./route/material.route");
const submissionRoutes = require("./route/submission.route");
const notificationRoutes = require("./route/notification.route");
const socketManager = require("./util/socket.manager");

// ⚙️ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use("/upload", express.static("src/upload"));
app.use("/upload/materials", express.static("src/upload/materials"));
app.use("/upload/submissions", express.static("src/upload/submissions"));

connectDB();

// 🔗 Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", userRoutes); 
app.use("/api/courses", courseRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 8080;
const server = require("http").createServer(app);

// 🔌 Initialize Socket.io
socketManager.init(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
