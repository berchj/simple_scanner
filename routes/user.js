const express = require("express");
const router = express.Router();
const Pool = require("../lib/pool");
const drupalHash = require("drupal-hash");
const jwt = require("jsonwebtoken");
router.post("/login", (req, res) => {
  Pool.getConnection((error, connection) => {
    if (error) throw error;
    let q = `SELECT * FROM users WHERE name = ${connection.escape(
      req.body.username
    )}`;
    connection.query(q, (error, rows, fields) => {
      if (error) throw error;
      if (rows.length) {
        let encryptedPass = rows[0]["pass"];
        if (drupalHash.checkPassword(req.body.password, encryptedPass)) {
          const token = jwt.sign(
            {
              name: rows[0]["name"],
              uid: rows[0]["uid"],
            },
            "secret",
            function (error, token) {
              res.status(200).json({
                message: "Authentication successful",
                token: token,
              })
              if(error){
                res.status(500).json({
                  message:"Something went wrong!"
                })
              }
            }
          );
        } else {
          res.status(404).json({ message: "Not Found" });
        }
      } else {
        res.status(400).json({ message: "Not Found" });
      }
    });
    connection.release();
  });
});

module.exports = router;
